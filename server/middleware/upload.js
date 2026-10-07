import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure and return Cloudinary instance dynamically based on environment secrets
const getCloudinary = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (cloud_name && api_key && api_secret) {
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret
    });
    return cloudinary;
  }
  return null;
};

// Memory storage works in any JavaScript/Serverless/Cloudflare Workers runtime
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|avif/;
  const extname = allowedTypes.test(path.extname(file.originalname || '').toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype || '');

  if (extname || mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP, AVIF) are supported!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter
});

/**
 * Process uploaded file:
 * - Uploads buffer directly to Cloudinary CDN if credentials exist
 * - Falls back to local uploads/ directory for offline local development if disk is writable
 */
export const processUploadedFile = async (file) => {
  const cld = getCloudinary();

  if (cld) {
    try {
      let uploadSource;
      if (file.buffer) {
        const b64 = Buffer.from(file.buffer).toString('base64');
        uploadSource = `data:${file.mimetype || 'image/jpeg'};base64,${b64}`;
      } else if (file.path) {
        uploadSource = file.path;
      } else {
        throw new Error('No file buffer or path provided for upload');
      }

      const result = await cld.uploader.upload(uploadSource, {
        folder: 'elqara_products',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      return result.secure_url;
    } catch (err) {
      console.warn('[Upload Middleware] Cloudinary upload error:', err.message);
      throw err;
    }
  }

  // Fallback for local development if Cloudinary credentials are not set
  if (file.buffer) {
    try {
      const uploadsDir = path.resolve('uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      const ext = path.extname(file.originalname || '') || '.jpg';
      const filename = `elqara-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, file.buffer);
      return `/uploads/${filename}`;
    } catch (err) {
      console.warn('[Upload Middleware] Local disk write fallback unavailable:', err.message);
      return '/logo-icon.svg';
    }
  }

  if (file.path) {
    return `/uploads/${path.basename(file.path)}`;
  }

  return '/logo-icon.svg';
};
