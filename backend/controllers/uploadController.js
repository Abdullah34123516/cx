import asyncHandler from 'express-async-handler';
import { uploadToS3 } from '../utils/s3.js';

// @desc    Upload a file to S3 via the backend
// @route   POST /api/uploads
// @access  Private (should be protected in a real app)
const uploadFile = asyncHandler(async (req, res) => {
    const { file, contentType, fileName } = req.body;
    if (!file || !contentType || !fileName) {
        res.status(400);
        throw new Error('Missing required file data for upload');
    }

    try {
        const imageUrl = await uploadToS3(file, contentType, fileName);
        res.status(201).json({ imageUrl });
    } catch (error) {
        console.error('Error uploading file to S3:', error);
        res.status(500).json({ message: 'Could not upload file' });
    }
});

export { uploadFile };
