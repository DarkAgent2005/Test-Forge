const mongoose = require('mongoose');

const requestFieldSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['string', 'number', 'boolean', 'object', 'array'], default: 'string' },
  required: { type: Boolean, default: false },
}, { _id: false });

const endpointSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  method: { type: String, enum: ['GET','POST','PUT','PATCH','DELETE'], required: true },
  path: { type: String, required: true },
  description: { type: String },
  requestFields: [requestFieldSchema],
}, { timestamps: true });

module.exports = mongoose.model('Endpoint', endpointSchema);
