const express = require("express");
const router = express.Router();
const UserController = require('../controllers/user.js');

router.post("/login",UserController.login);
router.post("/register",UserController.register);
router.post("/reset-password",UserController.verifyJWT,UserController.resetPassword);
router.post("/check", UserController.userCheck);
router.post("/verifyotp", UserController.verifyotp);
router.post("/newpassword",UserController.verifyJWT,UserController.newpassword);
router.post("/generateOtp", UserController.generateOtp);
router.post("/search",UserController.verifyJWT,UserController.search);

module.exports =router;