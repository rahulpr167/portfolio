import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const filePath = process.argv[2];
const folder   = process.argv[3] || 'portfolio/images';

if (!filePath) {
  console.error('Usage: node upload.mjs <file-path> [folder]');
  process.exit(1);
}

console.log(`Uploading "${filePath}" to folder "${folder}" ...`);

try {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'auto',
  });
  console.log('\n✅ Upload successful!');
  console.log('   Public ID :', result.public_id);
  console.log('   URL       :', result.secure_url);
} catch (err) {
  console.error('\n❌ Upload failed:', err.message);
}
