const asyncHandler = require('../utils/asyncHandler');
const contactLeadService = require('../services/contactLeadService');

const create = asyncHandler(async (req, res) => {
  const doc = await contactLeadService.createLead(req.body || {});
  res.status(201).json({ id: doc._id, message: 'Received' });
});

const list = asyncHandler(async (req, res) => {
  const result = await contactLeadService.listLeads(req.query || {});
  res.json(result);
});

module.exports = { create, list };
