const express = require("express");
const bodyParser = require('body-parser');
const app = express();
var cors = require("cors");
const UserRouter = require("./src/routers/user");
const BarberRouter = require("./src/routers/barber");
const SameRouter = require("./src/routers/same");
const BookingRouter = require("./src/routers/booking");

const globalErrorHandler = require("./src/controllers/ErrorController");



app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json());

app.use(cors({ origin: "*" }));
app.use('/api/v1/same', SameRouter);
app.use('/api/v1/user',UserRouter);
app.use('/api/v1/barber',BarberRouter);
app.use('/api/v1/booking', BookingRouter);

app.use(globalErrorHandler);
module.exports = app;
