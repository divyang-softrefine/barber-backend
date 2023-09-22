const express = require("express");
const router = express.Router();
const Same = require('../controllers/same.js');

router.get("/verify", Same.verifyEmail);
router.post("/register", Same.sendEmail);
router.post("/set-password", Same.setpassword);

module.exports = router;