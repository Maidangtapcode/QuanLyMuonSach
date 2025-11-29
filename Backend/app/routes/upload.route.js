const express = require("express");
const uploadController = require("../controllers/upload.controller");
const router = express.Router();

// Định nghĩa route gốc "/" (vì bên app.js đã gắn vào /api/upload rồi)
router.route("/")
    .post(uploadController.uploader, uploadController.uploadImage);

module.exports = router; // <-- Đã exports chưa?