const express = require("express");
const router = express.Router();
const BarberController = require('../controllers/barber.js');
const UserController = require('../controllers/user.js');

router.post("/login",BarberController.login);
router.post("/register",BarberController.register);
router.post("/services",UserController.verifyJWT,BarberController.services);
router.post("/shopdetail",UserController.verifyJWT,BarberController.shopdetail);

module.exports =router;