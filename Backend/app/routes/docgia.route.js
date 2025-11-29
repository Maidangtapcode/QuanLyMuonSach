const express = require("express");
const docgia = require("../controllers/docgia.controller");
const auth = require("../middleware/auth.middleware"); // Import Middleware
const router = express.Router();
// Route đổi mật khẩu
router.route("/change-password")
    .post([auth.verifyToken], docgia.changePassword);

// Route cập nhật hồ sơ cá nhân
router.route("/profile")
    .put([auth.verifyToken], docgia.updateProfile);
router.route("/login")
    .post(docgia.login);
router.route("/")
    .get(docgia.findAll)   
    .post(docgia.create)   
    .delete(docgia.deleteAll);

router.route("/:id")
    .get(docgia.findOne)   
    .put(docgia.update)    
    .delete(docgia.delete); 

module.exports = router;