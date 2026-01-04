/**
 * Builds the prompt string to send to Gemini for generating test cases.
 * 
 * @param {object} endpoint - The Endpoint document from DB
 * @param {string} endpoint.method - HTTP method (GET, POST, etc.)
 * @param {string} endpoint.path - Endpoint path (e.g., /api/login)
 * @param {string} [endpoint.description] - Endpoint description
 * @param {Array} [endpoint.requestFields] - List of fields with name, type, required
 * @returns {string} The prompt for the LLM
 */
function buildGenerateTestsPrompt(endpoint) {
  const fields = endpoint.requestFields || [];
  
  // Format the request fields cleanly for the LLM
  let schemaDescription = '';
  if (fields.length === 0) {
    schemaDescription = 'No request body or query parameter fields are defined for this endpoint.';
  } else {
    schemaDescription = fields.map(f => {
      return `- Field: "${f.name}"
  Type: ${f.type}
  Required: ${f.required ? 'Yes' : 'No'}`;
    }).join('\n');
  }

  // Exact template text that will be stored as the source of truth
  return `You are an expert QA and API Test Engineer. Your task is to generate a comprehensive suite of test cases for the following API endpoint.

---
API ENDPOINT DETAILS:
Method: ${endpoint.method}
Path: ${endpoint.path}
Description: ${endpoint.description || 'No description provided.'}

Request Schema Fields:
${schemaDescription}
---

OUTPUT FORMAT REQUIREMENTS:
- You must return ONLY a valid JSON array of test cases.
- Do NOT wrap the JSON in markdown code blocks or code fences (do NOT use \`\`\`json or \`\`\`).
- Do NOT include any explanations, introductory text, or trailing text. The output must be directly parseable by JSON.parse().

TEST CASE STRUCTURE:
Each object in the JSON array must have exactly these fields:
1. "name" (string): A descriptive, clear name of the test scenario (e.g., "Success: Create user with all optional fields", "Fail: Missing required 'email' field").
2. "category" (string): Must be exactly one of these four categories: "positive", "negative", "boundary", "security".
3. "requestBody" (object): The request body/payload to send. It must match the schemas defined above:
   - For GET requests: this represents query parameters or URL parameters if applicable.
   - For POST/PUT/PATCH/DELETE: this represents the JSON request payload.
   - Ensure the fields present or absent align with the test scenario category.
4. "expectedStatus" (number): The HTTP status code standard REST convention:
   - 200 or 201 for positive/valid cases.
   - 400 for bad input, missing required fields, or wrong types.
   - 401 or 403 only if the endpoint description mentions authorization or authentication requirements.

COVERAGE REQUIREMENTS:
Generate between 6 and 10 test cases covering:
- At least 1 "positive" case: A fully valid request containing all required (and optionally some optional) fields.
- 2-3 "negative" cases: Testing missing required fields, sending incorrect data types (e.g., number for string), or invalid formats.
- 1-2 "boundary" cases: Testing empty strings, extreme numbers, very long strings, or minimum/maximum values.
- 1-2 basic "security" cases: ONLY if relevant to the field types (e.g., SQL-injection-style strings like "OR '1'='1" in a text field, or basic script tags for XSS, or path traversal if appropriate). If not relevant, you can omit security cases or generate standard inputs.

Be precise, thorough, and ensure the JSON is perfectly valid.`;
}

module.exports = {
  buildGenerateTestsPrompt
};
