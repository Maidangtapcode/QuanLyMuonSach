const express = require("express");
const sach = require("../controllers/sach.controller");
const auth = require("../middleware/auth.middleware"); 

const router = express.Router();

router.route("/categories")
    .get(sach.findAllCategories); 

router.route("/")
    .get(sach.findAll) 
    .post([auth.verifyToken, auth.isAdmin], sach.create)
    .delete([auth.verifyToken, auth.isAdmin], sach.deleteAll); 

router.route("/:id")
    .get(sach.findOne) 
    .put([auth.verifyToken, auth.isAdmin], sach.update)
    .delete([auth.verifyToken, auth.isAdmin], sach.delete); 

module.exports = router;