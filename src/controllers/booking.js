const Barber = require("../models/barber");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { promisify } = require("util");
const {createJWTToken} = require("./user")

exports.shopdetail = catchAsync(async (req, res, next) => {
  const detail = req.body.detail;

  const user = req.user;

  const barber = await Barber.findOne({user_id:user._id});

    if(detail.start_time){
        throw new AppError("Please Provide start time", 400);
    }else if(detail.end_time){
        throw new AppError("Please Provide end time", 400);
    }

  barber.start_time = detail.start_time;
  barber.end_time = detail.end_time;
  barber.seats = detail.seats?detail.seats:0;

  await barber.save();

  res.send({
    message:"Barber Details Updated Successfully",
    data:barber
  })
});