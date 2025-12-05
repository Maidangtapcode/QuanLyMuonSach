const express = require("express");
const uploadController = require("../controllers/upload.controller");
const router = express.Router();
router.route("/")
    .post(uploadController.uploader, uploadController.uploadImage);

module.exports = router;