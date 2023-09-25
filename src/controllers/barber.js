const Barber = require("../models/barber");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { promisify } = require("util");
const {createJWTToken} = require("./user")

exports.services = catchAsync(async (req, res, next) => {
  const {goods} = req.body;
  if(goods && goods.length===0){
    throw new AppError("Services can't be empty", 404);
  }
  const barber = await Barber.findOne({_id:'650b01588d390cc1f06aff4d'});
  if(!barber){
    throw new AppError("Barber Not found", 404);
  }
  barber.services = goods;
  await barber.save();

  res.send({
    message:"Services Updated Successfully",
    data:barber.services
  })
});

exports.getservices = catchAsync(async (req, res, next) => {  
  const id = req.params.id;
    const barber = await Barber.findOne({_id:'650b01588d390cc1f06aff4d'});
    if(!barber){
      throw new AppError("Barber Not found", 404);
    }
    res.send({
      message:"Services",
      data:barber.services
    })
  });

exports.shopdetail = catchAsync(async (req, res, next) => {
  const detail = req.body;
  console.log(detail)
  const user = req.user;

  const barber = await Barber.findOne({ _id:'650b01588d390cc1f06aff4d'});

    if(!detail.start_time){
        throw new AppError("Please Provide start time", 400);
    }
    if(!detail.end_time){
        throw new AppError("Please Provide end time", 400);
    }
  let start_time = detail.start_time.split(":");
  start_time = {
    hour:start_time[0],
    minute:start_time[1]
  }
  let end_time = detail.end_time.split(":");
  end_time = {
    hour: end_time[0],
    minute: end_time[1]
  }
  console.log(start_time);
  console.log(barber)
  barber.start_time = start_time;
  console.log(end_time)
  barber.end_time = end_time;

  barber.seats = detail.seats?detail.seats:0;
  barber.owner_name = detail.owner_name;
  barber.shop_name=detail.shop_name;
  barber.phone = detail.phone;
  barber.address = detail.address;

  await barber.save();

  res.send({
    message:"Barber Details Updated Successfully",
    data:barber
  })
});

exports.getAllBarber = catchAsync(async (req, res, next) => {
      const pageSize = parseInt(req.query.pagesize) || 5;
      const page = parseInt(req.query.page) || 1;
      const query = req.query.search;
      let queries = query?query.split(" "):[];
     const fields = ["address", "shop_name", 'owner_name'];
     const orConditions = queries.map((query) =>
       fields.map((field) => ({ [field]: { $regex: query, $options: "i" } }))
     );
     const flattenedOrConditions = orConditions.reduce(
       (acc, conditions) => [...acc, { $or: conditions }],
       []
     );
     let con = {
    }
     if(flattenedOrConditions.length>0){
      con = { $and: flattenedOrConditions,}
     }
     
    // const barbers = await User.find({userRole:"customer"});
    const barbers = await Barber.aggregate([
       {
        $match:con
       },
      {
        $addFields: fields.reduce((fieldsToAdd, field) => {
          fieldsToAdd[field] = `$${field}`;
          return fieldsToAdd;
        }, {}),
      },
      {
        $facet: {
          metaData: [
            {
              $count: 'total',
            },
          ],
          records: [{ $skip: pageSize * (page-1) }, { $limit: pageSize }],
        },
      }
      ]);

    res.status(200).json({
      status: "success",
      message:"All Barber Fetched Successfully",
      data:barbers.length>0?barbers[0].records:barbers,
      total:barbers.length>0?barbers[0].metaData.length>0?barbers[0].metaData[0].total:'':'',
     });

})

exports.getOneBarber = catchAsync(async (req, res, next) => {

})    
