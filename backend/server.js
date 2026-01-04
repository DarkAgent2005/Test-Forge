require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const { generateTestCases, explainFailure } = require('./utils/gemini');
const TestResult = require('./models/TestResult');
const { Logger } = require('./utils/logger');
const projectsRouter = require('./routes/projects');
const endpointsRouter = require('./routes/endpoints');

const logger = new Logger();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { 
    message: err.message,
    stack: err.stack,
    path: req.path,
  });
  res.status(500).json({ error: 'Internal server error' });
});

// MongoDB connection (support both MONGODB_URI and legacy MONGO_URI env names)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (mongoUri) {
  mongoose.connect(mongoUri)
    .then(() => logger.info('MongoDB connected'))
    .catch(err => logger.error('MongoDB connection error', { error: err.message }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API health route (Phase 1 expects /api/health)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Generate Tests Endpoint
app.post('/generate-tests', async (req, res) => {
  try {
    const { url, method, body } = req.body;

    // Validate input
    if (!url || !method) {
      logger.warn('Invalid request', { received: { url, method } });
      return res.status(400).json({ 
        error: 'URL and Method are required',
        code: 'MISSING_PARAMS'
      });
    }

    logger.info('Test generation requested', { url, method });

    try {
      new URL(url);
    } catch (e) {
      logger.warn('Invalid URL format', { url });
      return res.status(400).json({ 
        error: 'Invalid URL format',
        code: 'INVALID_URL'
      });
    }

    const testCases = await generateTestCases(url, method, body);
    
    logger.info('Tests generated successfully', { 
      url,
      method,
      testCount: testCases.length,
    });

    res.json(testCases);
  } catch (error) {
    logger.error('Test generation failed', { 
      error: error.message,
      path: req.path,
    });
    res.status(500).json({ 
      error: error.message,
      code: 'GENERATION_FAILED'
    });
  }
});

// Run Tests Endpoint
app.post('/run-tests', async (req, res) => {
  try {
    const { url, method, testCases } = req.body;

    // Validate input
    if (!url || !method || !testCases || !Array.isArray(testCases)) {
      logger.warn('Invalid run-tests request', { 
        received: { url: !!url, method: !!method, testCasesArray: Array.isArray(testCases) }
      });
      return res.status(400).json({ 
        error: 'Invalid payload',
        code: 'INVALID_PAYLOAD'
      });
    }

    logger.info('Test execution started', { 
      url,
      method,
      totalTests: testCases.length,
    });

    const results = [];
    let passedCount = 0;
    let failedCount = 0;

    const MAX_CONCURRENT = 5;
    const MAX_RETRIES = 2;
    const INITIAL_RETRY_DELAY = 500;

    // Execute tests in parallel chunks
    for (let i = 0; i < testCases.length; i += MAX_CONCURRENT) {
      const chunk = testCases.slice(i, i + MAX_CONCURRENT);

      const chunkResults = await Promise.all(
        chunk.map(async (test) => executeTest(
          test,
          url,
          method,
          MAX_RETRIES,
          INITIAL_RETRY_DELAY
        ))
      );

      for (const result of chunkResults) {
        if (result.status === 'PASS') passedCount++;
        else failedCount++;
        results.push(result);
      }
    }

    const overallStatus = failedCount === 0 ? 'PASS' : 'FAIL';

    // Save to database
    let savedId = null;
    if (mongoose.connection.readyState === 1) {
      try {
        const newResult = new TestResult({
          url,
          method,
          overallStatus,
          totalTests: testCases.length,
          passedTests: passedCount,
          failedTests: failedCount,
          results
        });
        const savedResult = await newResult.save();
        savedId = savedResult._id;
        
        logger.info('Results saved to database', { 
          savedId,
          overallStatus,
          passedTests: passedCount,
          failedTests: failedCount,
        });
      } catch (err) {
        logger.warn('Failed to save results to DB', { error: err.message });
      }
    }

    logger.info('Test execution completed', { 
      url,
      method,
      totalTests: testCases.length,
      passedTests: passedCount,
      failedTests: failedCount,
      overallStatus,
      duration: 'N/A',
    });

    res.json({
      summary: {
        url,
        method,
        totalTests: testCases.length,
        passedTests: passedCount,
        failedTests: failedCount,
        overallStatus,
        passRate: testCases.length > 0 
          ? Math.round((passedCount / testCases.length) * 100) 
          : 0,
        dbId: savedId,
        executedAt: new Date().toISOString(),
      },
      results
    });
  } catch (error) {
    logger.error('Test execution failed', { 
      error: error.message,
      path: req.path,
    });
    res.status(500).json({ 
      error: 'Test execution failed',
      message: error.message,
      code: 'EXECUTION_FAILED'
    });
  }
});

// Get Results History
app.get('/results', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not connected',
        code: 'DB_UNAVAILABLE'
      });
    }

    const history = await TestResult.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(history);
  } catch (err) {
    logger.error('Failed to fetch results', { error: err.message });
    res.status(500).json({ 
      error: err.message,
      code: 'FETCH_FAILED'
    });
  }
});

// Helper: Execute a single test with retry logic
async function executeTest(test, url, method, maxRetries, initialDelay) {
  let attempt = 0;
  let delay = initialDelay;
  let currentActualStatus;
  let currentActualResponse;
  let currentResponseTime;
  let testPassed = false;

  while (attempt <= maxRetries && !testPassed) {
    if (attempt > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 5000); // Cap delay at 5s
    }

    const startTime = Date.now();
    try {
      const response = await axios({
        url,
        method,
        data: method !== 'GET' ? test.input : undefined,
        params: method === 'GET' ? test.input : undefined,
        validateStatus: () => true,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        }
      });

      currentResponseTime = Date.now() - startTime;
      currentActualStatus = response.status;
      currentActualResponse = response.data;

      if (currentActualStatus === test.expectedStatus) {
        testPassed = true;
      } else if (isRetryableStatus(currentActualStatus)) {
        attempt++;
      } else {
        // Non-retryable error, move on
        attempt = maxRetries + 1;
      }
    } catch (error) {
      currentResponseTime = Date.now() - startTime;
      currentActualStatus = error.response?.status || 503;
      currentActualResponse = error.message;

      if (isRetryableStatus(currentActualStatus)) {
        attempt++;
      } else {
        attempt = maxRetries + 1;
      }
    }
  }

  const testStatus = testPassed ? 'PASS' : 'FAIL_AFTER_RETRY';
  let aiExplanation = null;
  let aiFixSuggestion = null;

  // Get AI explanation for failures
  if (!testPassed) {
    try {
      const aiResponse = await explainFailure(
        url,
        method,
        test.input,
        test.expectedStatus,
        currentActualStatus,
        currentActualResponse
      );
      aiExplanation = aiResponse.explanation;
      aiFixSuggestion = aiResponse.fixSuggestion;
    } catch (err) {
      logger.warn('Could not generate AI explanation', { error: err.message });
    }
  }

  return {
    name: test.name,
    input: test.input,
    expectedStatus: test.expectedStatus,
    actualStatus: currentActualStatus,
    status: testStatus,
    responseTime: currentResponseTime,
    retryCount: testPassed && attempt > 0 ? attempt : 0,
    requestBody: test.input,
    responseBody: currentActualResponse,
    aiExplanation,
    aiFixSuggestion
  };
}

// Helper: Check if status is retryable
function isRetryableStatus(status) {
  return status >= 500 || status === 429 || status === 408;
}

// Start server
const PORT = process.env.PORT || 5000;
// Mount API routers
app.use('/api/projects', projectsRouter);
app.use('/api/endpoints', endpointsRouter);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

