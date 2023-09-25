const express = require("express");
const router = express.Router();
const BarberController = require('../controllers/barber.js');
const UserController = require('../controllers/user.js');

router.post("/services",UserController.verifyJWT,BarberController.services);
router.get("/getservices/:id",UserController.verifyJWT,BarberController.getservices);
router.patch("/shopdetail",UserController.verifyJWT,BarberController.shopdetail);
router.get("/getAllBarber",UserController.verifyJWT,BarberController.getAllBarber);

module.exports =router;