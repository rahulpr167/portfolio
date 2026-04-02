import { v2 as cloudinary } from 'cloudinary';
import { CATEGORIES } from '../../src/mediaManifest.js';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  // Allow cross-origin requests (for local dev with vercel dev)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { folder } = req.query;

  if (!folder) {
    return res.status(400).json({ error: 'Missing folder parameter' });
  }

  // Map slug (e.g. "social-media-creatives") → folder name (e.g. "Social Media Creatives")
  const category = CATEGORIES.find(c => c.slug === folder);
  const folderName = category ? category.folder : folder;

  // Cloudinary folder path: portfolio/images/<folder name>
  const prefix = `portfolio/images/${folderName}`;

  try {
    // Fetch images
    const imageResult = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      prefix,
      max_results: 100,
    });

    // Fetch videos
    const videoResult = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      prefix,
      max_results: 100,
    });

    const images = imageResult.resources.map(r => ({
      id: r.public_id,
      url: r.secure_url,
      type: 'image',
      width: r.width,
      height: r.height,
      format: r.format,
    }));

    const videos = videoResult.resources.map(r => ({
      id: r.public_id,
      url: r.secure_url,
      type: 'video',
      format: r.format,
    }));

    const resources = [...images, ...videos];

    return res.status(200).json({ resources, folder, total: resources.length });
  } catch (error) {
    console.error('Cloudinary API error:', error);
    return res.status(500).json({
      error: 'Failed to fetch media from Cloudinary',
      detail: error.message,
    });
  }
}
