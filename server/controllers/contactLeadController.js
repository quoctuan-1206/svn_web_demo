const contactLeadService = require('../services/contactLeadService');

async function create(req, res) {
  try {
    const doc = await contactLeadService.createLead(req.body || {});
    return res.status(201).json({ id: doc._id, message: 'Received' });
  } catch (err) {
    const status = err?.statusCode || 400;
    return res.status(status).json({ message: err.message || 'Failed to save' });
  }
}

async function list(req, res) {
  try {
    const { page, limit } = req.query || {};
    const result = await contactLeadService.listLeads({ page, limit });
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to list' });
  }
}

module.exports = { create, list };
