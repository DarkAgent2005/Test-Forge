const Endpoint = require('../models/Endpoint');
const TestCase = require('../models/TestCase');
const geminiService = require('./geminiService');
const { buildGenerateTestsPrompt } = require('../prompts/generateTests');
const { Logger } = require('../utils/logger');

const logger = new Logger();

/**
 * Strips markdown code blocks (e.g. ```json ... ```) from a text response.
 * @param {string} text 
 * @returns {string} Cleaned text
 */
function cleanResponseText(text) {
  if (!text) return '';
  let cleaned = text.trim();
  // Strip starting ```json or ```
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  // Strip ending ```
  cleaned = cleaned.replace(/\s*```$/i, '');
  return cleaned.trim();
}

/**
 * Fetches an endpoint, generates test cases using Gemini, parses and validates them, 
 * saves them as TestCase documents in MongoDB, and returns them.
 * 
 * @param {string} endpointId 
 * @returns {Promise<Array>} List of saved TestCase documents
 */
async function generateTestsForEndpoint(endpointId) {
  logger.info('Starting test generation for endpoint', { endpointId });

  // 1. Fetch Endpoint from MongoDB
  const endpoint = await Endpoint.findById(endpointId);
  if (!endpoint) {
    throw new Error(`Endpoint not found with ID: ${endpointId}`);
  }

  // 2. Build the prompt
  const prompt = buildGenerateTestsPrompt(endpoint);
  
  // 3. Call Gemini service
  let rawText;
  try {
    rawText = await geminiService.generateContent(prompt);
  } catch (error) {
    logger.error('Gemini content generation failed', { error: error.message });
    throw error;
  }

  // 4. Parse the response as JSON (clean code blocks first)
  let parsedCases = null;
  let parseError = null;

  try {
    const cleanedText = cleanResponseText(rawText);
    parsedCases = JSON.parse(cleanedText);
  } catch (err) {
    parseError = err;
    logger.warn('Initial JSON parsing failed. Retrying with correction prompt...', {
      error: err.message,
      rawTextLength: rawText ? rawText.length : 0
    });
  }

  // 5. If JSON.parse fails, retry once with a correction message
  if (parseError) {
    const retryPrompt = `${prompt}\n\nYour last response was not valid JSON. Return ONLY a raw JSON array. Do NOT include markdown code fences or any other wrapping text.`;
    try {
      rawText = await geminiService.generateContent(retryPrompt);
      const cleanedText = cleanResponseText(rawText);
      parsedCases = JSON.parse(cleanedText);
    } catch (retryErr) {
      logger.error('Gemini retry call or JSON parsing failed again', { error: retryErr.message });
      throw new Error(`JSON parsing failed after retry. Original error: ${parseError.message}. Retry error: ${retryErr.message}`);
    }
  }

  // 6. Validate response is an array
  if (!Array.isArray(parsedCases)) {
    logger.error('Gemini response is not a JSON array', { type: typeof parsedCases });
    throw new Error('Gemini response is not a valid JSON array');
  }

  // 7. Validate each test case individually
  const validCasesToSave = [];
  const validCategories = ['positive', 'negative', 'boundary', 'security'];

  for (const tc of parsedCases) {
    if (!tc || typeof tc !== 'object') {
      logger.warn('Skipping malformed test case (not an object)', { testCase: tc });
      continue;
    }

    const { name, category, requestBody, expectedStatus } = tc;

    // Validate required fields
    if (!name || typeof name !== 'string') {
      logger.warn('Skipping malformed test case (missing or invalid name)', { name, category, expectedStatus });
      continue;
    }

    if (!category || !validCategories.includes(category)) {
      logger.warn('Skipping malformed test case (missing or invalid category)', { name, category, expectedStatus });
      continue;
    }

    if (expectedStatus === undefined || typeof expectedStatus !== 'number') {
      logger.warn('Skipping malformed test case (missing or invalid expectedStatus)', { name, category, expectedStatus });
      continue;
    }

    // If valid, add to list to save
    validCasesToSave.push({
      endpoint: endpointId,
      name,
      category,
      requestBody: requestBody || {},
      expectedStatus,
      source: 'ai',
      confidence: 'high',
      needsReview: false
    });
  }

  if (validCasesToSave.length === 0) {
    logger.warn('No valid test cases were extracted from the Gemini response');
    return [];
  }

  // 8. Save valid test cases as TestCase documents linked to the endpoint
  const savedCases = [];
  for (const tcData of validCasesToSave) {
    const created = await TestCase.create(tcData);
    savedCases.push(created);
  }

  logger.info('Saved generated test cases successfully', {
    endpointId,
    generatedCount: parsedCases.length,
    savedCount: savedCases.length
  });

  return savedCases;
}

module.exports = {
  generateTestsForEndpoint
};
