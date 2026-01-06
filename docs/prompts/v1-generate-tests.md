# AI Test Case Generation Prompt (v1)

This document contains the prompt template used by TestForge AI to generate test cases for REST API endpoints using the Gemini API.

## Prompt Template

```
You are an expert QA and API Test Engineer. Your task is to generate a comprehensive suite of test cases for the following API endpoint.

---
API ENDPOINT DETAILS:
Method: {method}
Path: {path}
Description: {description}

Request Schema Fields:
{schemaDescription}
---

OUTPUT FORMAT REQUIREMENTS:
- You must return ONLY a valid JSON array of test cases.
- Do NOT wrap the JSON in markdown code blocks or code fences (do NOT use ```json or ```).
- Do NOT include any explanations, introductory text, or trailing text. The output must be directly parseable by JSON.parse().

TEST CASE STRUCTURE:
Each object in the JSON array must have exactly these fields:
1. "name" (string): A descriptive, clear name of the test scenario.
2. "category" (string): Must be exactly one of these four categories: "positive", "negative", "boundary", "security".
3. "requestBody" (object): The request body/payload to send.
4. "expectedStatus" (number): The HTTP status code standard REST convention.

COVERAGE REQUIREMENTS:
Generate between 6 and 10 test cases covering positive, negative, boundary, and security scenarios.
```

## Rationale for Prompt Structure

1. **Strict JSON Output Constraint**: The prompt explicitly commands the model to return *only* a valid JSON array without any markdown code block wrappers (like ` ```json `). This minimizes parsing overhead and syntax errors on the backend side.
2. **Schema Injection**: Including the exact request fields (their types and required statuses) directly in the prompt prevents the model from hallucinating or guessing the payload schema, ensuring the generated test payloads are valid and realistic.
3. **Structured Coverage & REST Expectations**: Explicitly directing the model to generate specific counts across specific categories (positive, negative, boundary, security) forces balanced test coverage, and referencing standard REST conventions anchors status code expectations correctly.
