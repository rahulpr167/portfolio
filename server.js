// Local dev API server — mirrors the Vercel serverless function exactly.
// Runs on port 3001; Vite proxies /api → http://localhost:3001
//
// Usage: npm run dev  (starts both this server AND Vite together via concurrently)

import 'dotenv/config';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app  = express();
const PORT = 3001;

// ── Lightweight in-memory cache ──────────────────────────────────────────────
// Prevents hammering the Cloudinary API on every hot-reload during development.
const cache     = new Map();   // key: category slug, value: { data, expiresAt }
const CACHE_TTL = 60_000;      // 60 seconds

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
}

// ── Helper: inject optimisation transformations into image URLs ───────────────
function optimiseUrl(url, resourceType) {
  if (resourceType !== 'image') return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

// ── Route: GET /api/projects/:category ───────────────────────────────────────
// Mirrors /api/projects/[category].js in the Vercel functions directory.
app.get('/api/projects/:category', async (req, res) => {
  const { category } = req.params;

  if (!category) {
    return res.status(400).json({ error: 'Missing category parameter' });
  }

  // Return cached response if still fresh
  const cached = getCached(category);
  if (cached) {
    console.log(`[API] Cache hit for "${category}"`);
    return res.json(cached);
  }

  const folder = `portfolio/images/${category}`;
  console.log(`[API] Searching Cloudinary folder: ${folder}`);

  try {
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(50)
      .with_field('tags')
      .execute();

    const resources = result.resources || [];

    const media = resources.map((r) => ({
      url:       optimiseUrl(r.secure_url, r.resource_type),
      type:      r.resource_type === 'video' ? 'video' : 'image',
      public_id: r.public_id,
      format:    r.format,
      width:     r.width  ?? null,
      height:    r.height ?? null,
    }));

    console.log(`[API] Returned ${media.length} items for "${category}"`);

    setCache(category, media);
    return res.json(media);

  } catch (err) {
    console.error('[API] Cloudinary Search error:', err.message);
    return res.status(500).json({
      error:  'Failed to fetch media from Cloudinary',
      detail: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Local API server running at http://localhost:${PORT}`);
  console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME || '⚠ CLOUDINARY_CLOUD_NAME not set'}\n`);
});
