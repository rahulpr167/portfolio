import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Inject Cloudinary image optimisation transformations.
 * Only applied to images — videos and raw files are returned as-is.
 */
function optimiseImageUrl(url) {
  return url.replace('/upload/', '/upload/q_auto,f_auto,w_800/');
}

/**
 * Build a preview thumbnail URL for a PDF stored as a raw Cloudinary resource.
 * Uses Cloudinary's pg_1 (page 1) transformation to render the first page as JPEG.
 */
function pdfPreviewUrl(cloudName, publicId) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/pg_1,q_auto,f_auto,w_800/${publicId}.jpg`;
}

/**
 * Vercel serverless handler
 * Route: GET /api/projects/[category]
 *
 * Fetches images, videos AND raw PDFs from:
 *   portfolio/images/{category}
 *
 * Returns a flat JSON array — each item has:
 *   url, preview, type, format, public_id, width, height
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

  const { category } = req.query;
  if (!category) return res.status(400).json({ error: 'Missing category parameter' });

  const folder     = `portfolio/images/${category}`;
  const cloudName  = process.env.CLOUDINARY_CLOUD_NAME;

  try {
    // ── Run two parallel searches: images+videos AND raw (PDF) ───────────────
    const [mediaResult, rawResult] = await Promise.all([
      // Images and videos
      cloudinary.search
        .expression(`folder:${folder}`)
        .sort_by('created_at', 'desc')
        .max_results(50)
        .with_field('tags')
        .execute(),

      // Raw files (PDFs uploaded with resource_type: raw)
      cloudinary.search
        .expression(`folder:${folder} AND resource_type:raw`)
        .sort_by('created_at', 'desc')
        .max_results(50)
        .execute(),
    ]);

    const mediaResources = mediaResult.resources || [];
    const rawResources   = rawResult.resources   || [];

    // ── Map images + videos ───────────────────────────────────────────────────
    const mediaItems = mediaResources.map((r) => ({
      url:       r.resource_type === 'image'
                   ? optimiseImageUrl(r.secure_url)
                   : r.secure_url,
      preview:   r.resource_type === 'image'
                   ? optimiseImageUrl(r.secure_url)
                   : r.secure_url,        // videos use the video URL as preview
      type:      r.resource_type,         // 'image' | 'video'
      format:    r.format,
      public_id: r.public_id,
      width:     r.width  ?? null,
      height:    r.height ?? null,
    }));

    // ── Map raw PDFs ──────────────────────────────────────────────────────────
    const pdfItems = rawResources
      .filter((r) => r.format === 'pdf')
      .map((r) => ({
        url:       r.secure_url,           // original PDF download URL
        preview:   pdfPreviewUrl(cloudName, r.public_id), // first page as image
        type:      'raw',
        format:    'pdf',
        public_id: r.public_id,
        width:     null,
        height:    null,
      }));

    const allItems = [...mediaItems, ...pdfItems];

    return res.status(200).json(allItems.length ? allItems : []);

  } catch (error) {
    console.error('[API] Cloudinary error:', error.message);
    return res.status(500).json({
      error:  'Failed to fetch media from Cloudinary',
      detail: error.message,
    });
  }
}
