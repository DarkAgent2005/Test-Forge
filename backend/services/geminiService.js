const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY is not defined in the environment.');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

/**
 * Helper function to run the content generation call.
 * @param {object} model 
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
async function executeCall(model, prompt) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Calls the Gemini API with the given prompt and returns the raw text response.
 * Implements a retry once on 429 Rate Limit error after a 2-second delay.
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
async function generateContent(prompt) {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });
  
  try {
    return await executeCall(model, prompt);
  } catch (error) {
    const isRateLimit = error.status === 429 || 
                        error.statusCode === 429 || 
                        (error.message && (
                          error.message.includes('429') || 
                          error.message.includes('RESOURCE_EXHAUSTED') ||
                          error.message.includes('Quota exceeded')
                        ));
    
    if (isRateLimit) {
      console.warn('Gemini API call rate limited (429). Retrying in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        return await executeCall(model, prompt);
      } catch (retryError) {
        throw new Error(`Gemini API call failed after retry: ${retryError.message}`);
      }
    }
    
    throw new Error(`Gemini API call failed: ${error.message}`);
  }
}

module.exports = {
  generateContent
};
