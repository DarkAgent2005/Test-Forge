const { GoogleGenAI } = require('@google/genai');
const { Logger } = require('./logger');

const logger = new Logger();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `You are an expert API testing engineer with deep knowledge of REST APIs, HTTP protocols, and comprehensive testing strategies.
Your task is to generate comprehensive, intelligent test cases for API endpoints.
Focus on edge cases, error scenarios, and real-world usage patterns.`;

async function generateTestCases(url, method, description) {
  const prompt = `Generate comprehensive API test cases for the following endpoint:

URL: ${url}
HTTP Method: ${method}
Description/Context: ${description || 'General API endpoint'}

Create intelligent test cases that cover:
1. Valid requests with typical data
2. Boundary conditions (empty fields, max length, minimum values)
3. Invalid input types (string instead of number, etc.)
4. Missing required fields
5. Authentication/Authorization scenarios (if applicable)
6. SQL injection/XSS attempts (if applicable)
7. Rate limiting scenarios
8. Timeout scenarios

IMPORTANT OUTPUT FORMAT:
Return ONLY a valid JSON array, with NO markdown formatting, code blocks, or extra explanation.
Each test case must have:
- "name": String (descriptive name of the test)
- "input": Object or string (the exact payload/query parameters to send)
- "expectedStatus": Number (expected HTTP status code)

Example format (return ONLY JSON, nothing else):
[
  {"name": "Valid request", "input": {"key": "value"}, "expectedStatus": 200},
  {"name": "Invalid format", "input": {"key": 123}, "expectedStatus": 400}
]`;

  try {
    logger.debug('Generating test cases', { url, method });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
        responseMimeType: 'application/json',
      },
    });

    let text = response.text.trim();
    
    // Clean markdown formatting
    text = text.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();
    
    // Validate and parse JSON
    const testCases = JSON.parse(text);
    
    if (!Array.isArray(testCases)) {
      throw new Error('Response is not an array');
    }

    // Validate each test case
    const validatedCases = testCases.map(tc => ({
      name: String(tc.name || 'Unnamed test').substring(0, 200),
      input: tc.input || {},
      expectedStatus: Number(tc.expectedStatus) || 200,
    }));

    logger.info('Test cases generated successfully', { 
      url, 
      method,
      count: validatedCases.length 
    });

    return validatedCases;
  } catch (error) {
    logger.error('Gemini generation error', { 
      url, 
      method, 
      error: error.message,
      errorType: error.name,
    });
    throw new Error(`Failed to generate test cases: ${error.message}`);
  }
}

async function explainFailure(
  url,
  method,
  input,
  expectedStatus,
  actualStatus,
  actualResponse
) {
  const prompt = `An API test failed. Provide a concise technical analysis.

URL: ${url}
Method: ${method}
Input: ${JSON.stringify(input)}
Expected Status: ${expectedStatus}
Actual Status: ${actualStatus}
Response: ${JSON.stringify(actualResponse, null, 2).substring(0, 500)}

IMPORTANT:
- Keep explanation under 100 words
- Be technical and specific
- Suggest actionable fixes

Return ONLY valid JSON with NO markdown:
{"explanation": "technical reason", "fixSuggestion": "how to fix"}`;

  try {
    logger.debug('Explaining failure', { url, method, expectedStatus, actualStatus });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 500,
        responseMimeType: 'application/json',
      },
    });

    let text = response.text.trim();
    text = text.replace(/^```json\n?/i, '').replace(/^```\n?/i, '').replace(/\n?```$/i, '').trim();
    
    const result = JSON.parse(text);
    
    if (!result.explanation || !result.fixSuggestion) {
      throw new Error('Invalid response format');
    }

    logger.info('Failure explained', { url, method });
    
    return {
      explanation: String(result.explanation).substring(0, 500),
      fixSuggestion: String(result.fixSuggestion).substring(0, 500),
    };
  } catch (error) {
    logger.warn('Could not explain failure', { 
      url,
      method,
      error: error.message 
    });
    
    return {
      explanation: `HTTP ${actualStatus} response received when ${expectedStatus} was expected. Check API logs for details.`,
      fixSuggestion: `Verify the request payload and endpoint configuration. HTTP ${actualStatus} typically indicates ${getStatusCodeMeaning(actualStatus)}.`,
    };
  }
}

// Helper: Get human-readable status code meaning
function getStatusCodeMeaning(status) {
  const meanings = {
    400: 'Bad Request - Invalid input',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - Permission denied',
    404: 'Not Found - Resource does not exist',
    409: 'Conflict - Resource conflict',
    429: 'Too Many Requests - Rate limited',
    500: 'Internal Server Error',
    503: 'Service Unavailable',
  };
  return meanings[status] || 'Server error';
}

module.exports = { generateTestCases, explainFailure };
