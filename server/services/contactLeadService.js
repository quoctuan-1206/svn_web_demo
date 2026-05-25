const ContactLead = require('../models/ContactLead');
const { httpError } = require('../utils/httpError');
const { parsePagination, paginatedResult } = require('../utils/pagination');

const ALLOWED_SOURCES = new Set(['contact_page', 'homepage_cta', 'site']);

function normalizeString(value) {
  if (value == null) return '';
  return String(value).trim();
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
    throw httpError(400, 'Missing required fields');
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
    source: ALLOWED_SOURCES.has(source) ? source : 'site',
  });

  return doc.toObject();
}

async function listLeads({ page, limit }) {
  const { page: safePage, limit: safeLimit, skip } = parsePagination(
    { page, limit },
    { defaultLimit: 50 },
  );

  const [items, total] = await Promise.all([
    ContactLead.find({}).sort({ createdAt: -1 }).skip(skip).limit(safeLimit).lean(),
    ContactLead.countDocuments({}),
  ]);

  return paginatedResult({ items, total, page: safePage, limit: safeLimit });
}

module.exports = { createLead, listLeads };
