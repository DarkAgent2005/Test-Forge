const Project = require('../models/Project');

const validateProject = (req, res, next) => {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'Project name is required' });
  }
  next();
};

const validateEndpoint = async (req, res, next) => {
  const { project, method, path } = req.body;
  if (!project) return res.status(400).json({ error: 'project id is required' });
  if (!method) return res.status(400).json({ error: 'method is required' });
  if (!path) return res.status(400).json({ error: 'path is required' });

  const allowed = ['GET','POST','PUT','PATCH','DELETE'];
  if (!allowed.includes(method)) return res.status(400).json({ error: 'invalid method' });

  try {
    const proj = await Project.findById(project).lean();
    if (!proj) return res.status(404).json({ error: 'project not found' });
  } catch (err) {
    return res.status(500).json({ error: 'failed to validate project' });
  }

  next();
};

module.exports = { validateProject, validateEndpoint };
