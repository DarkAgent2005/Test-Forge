const mongoose = require('mongoose');

const legacyResultItemSchema = new mongoose.Schema({
  name: String,
  input: mongoose.Schema.Types.Mixed,
  expectedStatus: Number,
  actualStatus: Number,
  status: { type: String, enum: ['PASS', 'FAIL_AFTER_RETRY'] },
  responseTime: Number,
  retryCount: Number,
  requestBody: mongoose.Schema.Types.Mixed,
  responseBody: mongoose.Schema.Types.Mixed,
  aiExplanation: String,
  aiFixSuggestion: String,
}, { _id: false });

const testResultSchema = new mongoose.Schema({
  // New canonical fields for Phase 1 compatibility
  testRun: { type: mongoose.Schema.Types.ObjectId, ref: 'TestRun' },
  testCase: { type: mongoose.Schema.Types.ObjectId, ref: 'TestCase' },
  actualStatus: { type: Number },
  actualBody: { type: mongoose.Schema.Types.Mixed },
  responseTimeMs: { type: Number },
  passed: { type: Boolean },
  error: { type: String },

  // Keep legacy fields used by existing endpoints to avoid breaking changes
  url: { type: String },
  method: { type: String },
  overallStatus: { type: String, enum: ['PASS', 'FAIL'] },
  totalTests: { type: Number, default: 0 },
  passedTests: { type: Number, default: 0 },
  failedTests: { type: Number, default: 0 },
  results: [legacyResultItemSchema],

}, { timestamps: true });

module.exports = mongoose.model('TestResult', testResultSchema);
