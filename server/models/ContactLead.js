const mongoose = require('mongoose');

const contactLeadSchema = new mongoose.Schema(
  {
    purpose: { type: String, trim: true, required: true },
    fullName: { type: String, trim: true, required: true },
    email: { type: String, trim: true, required: true },
    companyName: { type: String, trim: true, required: true },
    jobTitle: { type: String, trim: true, required: true },
    industry: { type: String, trim: true },
    country: { type: String, trim: true, required: true },
    businessNeeds: { type: String, trim: true, required: true },
    /** 'contact_page' | 'homepage_cta' */
    source: { type: String, trim: true, default: 'site' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('ContactLead', contactLeadSchema);
