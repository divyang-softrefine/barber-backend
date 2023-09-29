const express = require("express");
const router = express.Router();
const BarberController = require('../controllers/barber.js');
const UserController = require('../controllers/user.js');
const BookingController = require('../controllers/booking.js');

router.post("/gettimes/id", UserController.verifyJWT, BookingController.gettimes);
router.get("/myappointment", UserController.verifyJWT, BookingController.getmyappointmnet);
router.post("/bookappointment", UserController.verifyJWT, BookingController.bookappointment);
// router.get("/getAllBarber", UserController.verifyJWT, BarberController.getAllBarber);

module.exports = router;