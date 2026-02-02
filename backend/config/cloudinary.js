const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'darecoin_proofs',
        allowed_formats: ['jpg', 'png', 'mp4', 'mov'],
        resource_type: 'auto', // Important for video support
    },
});

module.exports = { cloudinary, storage };
