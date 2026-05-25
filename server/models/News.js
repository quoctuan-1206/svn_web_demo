const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    excerpt: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
      trim: true,
    },
    titleEn: { type: String, trim: true },
    excerptEn: { type: String, trim: true },
    contentEn: { type: String, trim: true },
    image: {
      type: String,
      trim: true,
    },
    /** Ảnh minh họa thêm (URL hoặc path uploads) */
    gallery: {
      type: [String],
      default: () => [],
    },
    publishedAt: {
      type: Date,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);
