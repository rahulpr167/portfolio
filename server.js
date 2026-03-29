// Local dev API server — mirrors the Vercel serverless function
// Runs on port 3001; Vite proxies /api → http://localhost:3001
//
// Usage: npm run dev  (starts both this server AND Vite together)

import 'dotenv/config';
import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 3001;

// Mirror of /api/projects/[folder].js
app.get('/api/projects/:folder', async (req, res) => {
  const { folder } = req.params;

  if (!folder) {
    return res.status(400).json({ error: 'Missing folder parameter' });
  }

  const prefix = `portfolio/images/${folder}`;

  console.log(`[API] Fetching Cloudinary folder: ${prefix}`);

  try {
    const [imageResult, videoResult] = await Promise.all([
      cloudinary.api.resources({ resource_type: 'image', type: 'upload', prefix, max_results: 100 }),
      cloudinary.api.resources({ resource_type: 'video', type: 'upload', prefix, max_results: 100 }),
    ]);

    const resources = [
      ...imageResult.resources.map(r => ({
        id:     r.public_id,
        url:    r.secure_url,
        type:   'image',
        width:  r.width,
        height: r.height,
        format: r.format,
      })),
      ...videoResult.resources.map(r => ({
        id:     r.public_id,
        url:    r.secure_url,
        type:   'video',
        format: r.format,
      })),
    ];

    console.log(`[API] Returned ${resources.length} items`);
    return res.json({ resources, folder, total: resources.length });
  } catch (err) {
    console.error('[API] Cloudinary error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch from Cloudinary', detail: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Local API server running at http://localhost:${PORT}`);
  console.log(`   Cloud: ${process.env.CLOUDINARY_CLOUD_NAME || '⚠ CLOUDINARY_CLOUD_NAME not set'}\n`);
});
