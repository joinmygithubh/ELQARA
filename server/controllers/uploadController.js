import { processUploadedFile } from '../middleware/upload.js';

// @desc    Upload single image
// @route   POST /api/upload
// @access  Private/Admin
export const uploadSingle = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const url = await processUploadedFile(req.file);

    res.json({
      success: true,
      url,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private/Admin
export const uploadMultiple = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files uploaded'
      });
    }

    const urls = [];
    for (const file of req.files) {
      const url = await processUploadedFile(file);
      urls.push(url);
    }

    res.json({
      success: true,
      urls,
      message: `${urls.length} images uploaded successfully`
    });
  } catch (error) {
    next(error);
  }
};
