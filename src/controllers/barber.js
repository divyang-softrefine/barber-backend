const Barber = require("../models/barber");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { promisify } = require("util");
const {createJWTToken} = require("./user")

exports.login =catchAsync(async (req, res, next) => {
  if (!req.body.email) {
   throw new AppError("Please Provide Email", 400);
  }
 if (!req.body.password) {
   throw new AppError("Please Provide Password", 400);
 }
  const myUser = await Barber.findOne({ email: req.body.email });

  if (!myUser) {
    throw new AppError("Barber Does Not Exist", 404);
  }
  const validPassword=await bcrypt.compare(req.body.password,myUser.password);

  if (!validPassword ) {
    throw new AppError("Invalid Credentials.", 400);
  }
  req.user = myUser;
  myUser.loc = req.body.loc
  myUser.save();
  createJWTToken(myUser, 201, res);
});

exports.register = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    throw new AppError("Please Provide Email", 400);
  }
  if (!req.body.password) {
    throw new AppError("Please Provide Password", 400);
  }
  const myUser = await Barber.findOne({ email: req.body.email });
  if(myUser) {
    throw new AppError("Eamil Already Exist", 404);
  }
  const newUser = new User({email:req.body.email,password:req.body.password,phone:req.body.phone,owner_name:req.body.owner_name,shop_name:req.body.shop_name,address:req.body.address});
  await newUser.save();
  res.send({
    message:"User Created Successfully",
    user:newUser
  })
});

exports.services = catchAsync(async (req, res, next) => {
  const services = req.body;

  if(services.length===0){
    throw new AppError("Services can't be empty", 404);
  }

  const user = req.user;

  const barber = await Barber.findOne({user_id:user._id});

  barber.services = services;

  await barber.save();

  res.send({
    message:"Services Updated Successfully",
    data:barber
  })
});

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