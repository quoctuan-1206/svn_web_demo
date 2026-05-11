const ContactLead = require('../models/ContactLead');

function normalizeString(v) {
  if (v == null) return '';
  return String(v).trim();
}

async function createLead(body) {
  const purpose = normalizeString(body?.purpose);
  const fullName = normalizeString(body?.fullName);
  const email = normalizeString(body?.email);
  const companyName = normalizeString(body?.companyName);
  const jobTitle = normalizeString(body?.jobTitle);
  const industry = normalizeString(body?.industry);
  const country = normalizeString(body?.country);
  const businessNeeds = normalizeString(body?.businessNeeds);
  const source = normalizeString(body?.source) || 'site';

  if (!purpose || !fullName || !email || !companyName || !jobTitle || !country || !businessNeeds) {
    const e = new Error('Missing required fields');
    e.statusCode = 400;
    throw e;
  }

  const doc = await ContactLead.create({
    purpose,
    fullName,
    email,
    companyName,
    jobTitle,
    industry: industry || undefined,
    country,
    businessNeeds,
    source: ['contact_page', 'homepage_cta', 'site'].includes(source) ? source : 'site',
  });

  return doc.toObject();
}

async function listLeads({ page, limit }) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    ContactLead.find({}).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    ContactLead.countDocuments({}),
  ]);

  return {
    data: items,
    page: safePage,
    limit: safeLimit,
    total,
    pages: Math.ceil(total / safeLimit) || 1,
  };
}

module.exports = { createLead, listLeads };
