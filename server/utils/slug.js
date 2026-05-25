const slugify = require('slugify');

async function uniqueSlug(Model, title, fallback = 'item') {
  let base = slugify(String(title), { lower: true, strict: true });
  if (!base) base = fallback;

  let candidate = base;
  let n = 1;
  while (await Model.exists({ slug: candidate })) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

module.exports = { uniqueSlug };
