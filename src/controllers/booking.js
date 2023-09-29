const Barber = require("../models/barber");
const Booking = require("../models/booking");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { promisify } = require("util");
const {createJWTToken} = require("./user");
const { default: mongoose } = require("mongoose");
const barber = require("../models/barber");

//barber whole is taken as dummy;
exports.gettimes = catchAsync(async (req, res, next) => {
  const barber_id = req.params.id ;

  const barber = await Barber.findOne({ _id: barber_id }).lean();
  const seats = barber.seats || 1;

  const start = [barber.start_time.hours, barber.start_time.minutes];
  const end = [barber.end_time.hours, barber.end_time.minutes];

  const time = [parseInt(parseInt(req.body.time) / 60),parseInt(req.body.time)%60] ;
  
  let data =  [];
  let today = new Date(req.body.appointment_date);
  let tomorrow = new Date(req.body.appointment_date);
  tomorrow = new Date(tomorrow.setDate(tomorrow.getDate()+1));
  while(true){
    let startTime = new Date(today.getFullYear(), today.getMonth() , today.getDate(), start[0], start[1]);
    start[0] = start[0] + time[0] + parseInt((start[1] + time[1])/60);
    start[1] = (start[1] + time[1]) % 60;
    let endTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(),start[0], start[1]);
    if(start[0]>end[0] || (start[0]===end[0]&& start[1]>end[1]) )break;
    data.push({ startTime,endTime,count:0 })
  }
  

  const booking = await Booking.aggregate([
    {
      $match:{
        first_id:new mongoose.Types.ObjectId(barber_id)
      }
    },
    {
      $unwind: "$bookings",
    },
    {
      $match: {
        $and: [
          {
            "bookings.start_time": {
              $gte: today ,
            },
          },
          {
            "bookings.end_time": {
              $lte: tomorrow,
            },
          },
        ],
      },
    },
  ]);
  let final = [];

  data.forEach((d)=>{
    booking.forEach((b)=>{
      
        if(!((d.startTime<b.bookings.start_time && d.endTime<=b.bookings.start_time)||
          (d.startTime >= b.bookings.end_time && d.endTime > b.bookings.end_time)
          )){
          d.count++;
        }
    })
  })
  data.forEach((d) => {
    let label = d.startTime.getHours() + ":" + d.startTime.getMinutes() + "-" + d.endTime.getHours() + ":" + d.endTime.getMinutes();
    let value =label;
      if (d.count>=seats) {
       final.push({disabled:true,label,value});
      }else{
        final.push({ disabled: false, label, value });
      }
  })

  res.send({
    message:"Barber Detail Successfully",
    data:final
  })
});

exports.bookappointment = catchAsync(async (req, res, next) => {
  const {barber_id,start_time,end_time,services,time} = req.body;

  const user = req.user;
  const bb = await Booking.findOne({ first_id: new mongoose.Types.ObjectId(barber_id), userRole: 'barber' });
  bb.bookings.push({start_time,end_time,services,total:time,second_id:user._id});
  await bb.save();

  res.send({
    message: "Appointment Booked Successfully",
    data: bb
  })
});

exports.getmyappointmnet = catchAsync(async (req, res, next) => {
  const bookings = await Booking.findOne({ first_id: new mongoose.Types.ObjectId(req.user._id)});

  res.send({
    message:"success",
    data:barber.bookings
  })
})