const express = require('express');
const router = express.Router();
const Endpoint = require('../models/Endpoint');
const Project = require('../models/Project');
const TestCase = require('../models/TestCase');
const { validateEndpoint } = require('../middleware/validate');
const testGeneratorService = require('../services/testGeneratorService');

// Create endpoint (requires project id in body)
router.post('/', validateEndpoint, async (req, res) => {
  try {
    const { project, method, path, description, requestFields } = req.body;
    const created = await Endpoint.create({ project, method, path, description, requestFields });
    return res.status(201).json(created);
  } catch (err) {
    console.error('endpoints:create error', err);
    return res.status(500).json({ error: err.message });
  }
});

// List endpoints for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const endpoints = await Endpoint.find({ project: req.params.projectId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(endpoints);
  } catch (err) {
    console.error('endpoints:list error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get one endpoint
router.get('/:id', async (req, res) => {
  try {
    const ep = await Endpoint.findById(req.params.id).lean();
    if (!ep) return res.status(404).json({ error: 'Endpoint not found' });
    return res.status(200).json(ep);
  } catch (err) {
    console.error('endpoints:get error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update endpoint
router.put('/:id', async (req, res) => {
  try {
    const updated = await Endpoint.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Endpoint not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('endpoints:update error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete endpoint
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Endpoint.findByIdAndDelete(req.params.id).lean();
    if (!removed) return res.status(404).json({ error: 'Endpoint not found' });
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('endpoints:delete error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Generate test cases for an endpoint using Gemini API
router.post('/:id/generate-tests', async (req, res) => {
  try {
    const testCases = await testGeneratorService.generateTestsForEndpoint(req.params.id);
    return res.status(201).json(testCases);
  } catch (err) {
    console.error('endpoints:generate-tests error', err);
    return res.status(500).json({ error: err.message });
  }
});

// List all test cases for an endpoint
router.get('/:id/test-cases', async (req, res) => {
  try {
    const testCases = await TestCase.find({ endpoint: req.params.id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json(testCases);
  } catch (err) {
    console.error('endpoints:list-test-cases error', err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
