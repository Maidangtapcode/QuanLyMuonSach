const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const ApiError = require('../api-error');
const config = require('../config'); 
cloudinary.config({
    cloud_name: config.cloudinary.cloud_name,
    api_key: config.cloudinary.api_key,
    api_secret: config.cloudinary.api_secret
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'quan-ly-thu-vien',
        allowed_formats: ['jpg', 'png', 'jpeg'],
    },
});

const upload = multer({ storage: storage });

exports.uploadImage = (req, res, next) => {
    if (!req.file) {
        return next(new ApiError(400, "Không có file nào được tải lên!"));
    }
    res.send({ url: req.file.path });
};

exports.uploader = upload.single('image');