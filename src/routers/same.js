const express = require("express");
const router = express.Router();
const Same = require('../controllers/same.js');
const UserController = require('../controllers/user.js')
router.get("/verify", Same.verifyEmail);
router.post("/register", Same.sendEmail);
router.post("/set-password", Same.setpassword);
router.post("/reset-password", UserController.verifyJWT, Same.resetPassword);
module.exports = router;