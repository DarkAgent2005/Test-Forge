const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  endpoint: { type: mongoose.Schema.Types.ObjectId, ref: 'Endpoint', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['positive','negative','boundary','security'] },
  requestBody: { type: mongoose.Schema.Types.Mixed },
  expectedStatus: { type: Number, required: true },
  source: { type: String, enum: ['ai','manual'], default: 'ai' },
  confidence: { type: String, enum: ['high','medium','low'], default: 'high' },
  confidenceReason: { type: String },
  needsReview: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('TestCase', testCaseSchema);
