const express = require("express");
const router = express.Router();
const UserController = require('../controllers/user.js');

router.post("/login",UserController.login);
router.post("/check", UserController.userCheck);
router.post("/search",UserController.verifyJWT,UserController.search);
router.patch("/update/:id", UserController.verifyJWT, UserController.update);

module.exports =router;