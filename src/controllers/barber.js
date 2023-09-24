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
  const {goods} = req.body;
console.log(goods)
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
