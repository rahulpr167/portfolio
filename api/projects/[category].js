import { v2 as cloudinary } from 'cloudinary';

// ─── Cloudinary config (uses Vercel env vars in production) ──────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Inject Cloudinary optimisation transformations into an image URL.
 * Replaces the plain "/upload/" segment with "/upload/q_auto,f_auto,w_800/".
 * Video URLs are returned unchanged.
 */
function optimiseUrl(url, resourceType) {
  if (resourceType !== 'image') return url;
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

/**
 * Vercel serverless handler
 * Route: GET /api/projects/[category]
 *
 * Example: /api/projects/business-card-designs
 *   → searches Cloudinary folder: portfolio/images/business-card-designs
 *   → returns flat JSON array of media objects
 */
export default async function handler(req, res) {
  // ── CORS headers (safe default for same-origin Vercel deployments) ────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // ── CDN cache: 60 s at the edge, serve stale while revalidating ───────────
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ error: 'Missing category parameter' });
  }

  // Cloudinary folder path — matches the exact structure in Media Library
  const folder = `portfolio/images/${category}`;

  try {
    // ── Cloudinary Search API ─────────────────────────────────────────────
    // One call retrieves both images AND videos from the folder.
    const result = await cloudinary.search
      .expression(`folder:${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(50)
      .with_field('tags')
      .execute();

    const resources = result.resources || [];

    if (resources.length === 0) {
      // Return an empty array — not an error; folder may just be empty
      return res.status(200).json([]);
    }

    // ── Map to clean, flat response shape ────────────────────────────────
    const media = resources.map((r) => ({
      url:       optimiseUrl(r.secure_url, r.resource_type),
      type:      r.resource_type === 'video' ? 'video' : 'image',
      public_id: r.public_id,
      format:    r.format,
      width:     r.width  ?? null,
      height:    r.height ?? null,
    }));

    return res.status(200).json(media);

  } catch (error) {
    console.error('[API] Cloudinary Search error:', error.message);
    return res.status(500).json({
      error:  'Failed to fetch media from Cloudinary',
      detail: error.message,
    });
  }
}
