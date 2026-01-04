const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Endpoint = require('../models/Endpoint');
const { validateProject } = require('../middleware/validate');

// Create project
router.post('/', validateProject, async (req, res) => {
  try {
    const { name, description, baseUrl } = req.body;
    const created = await Project.create({ name, description, baseUrl });
    return res.status(201).json(created);
  } catch (err) {
    console.error('projects:create error', err);
    return res.status(500).json({ error: err.message });
  }
});

// List projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json(projects);
  } catch (err) {
    console.error('projects:get error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Get one project with populated endpoints
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const endpoints = await Endpoint.find({ project: project._id }).lean();
    return res.status(200).json({ ...project, endpoints });
  } catch (err) {
    console.error('projects:update error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Update project
router.put('/:id', async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!updated) return res.status(404).json({ error: 'Project not found' });
    return res.status(200).json(updated);
  } catch (err) {
    console.error('projects:delete error', err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete project (and its endpoints)
router.delete('/:id', async (req, res) => {
  try {
    const removed = await Project.findByIdAndDelete(req.params.id).lean();
    if (!removed) return res.status(404).json({ error: 'Project not found' });
    await Endpoint.deleteMany({ project: req.params.id });
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
