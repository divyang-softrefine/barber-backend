const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { promisify } = require("util");

exports.userCheck = catchAsync(async (req, res, next) => {

  if (!req.body.email) {
    throw new AppError("Please Provide Eamil", 400);
  }

  const myUser = await User.findOne({ email: req.body.email });
  // if (!myUser) {
  //   throw new AppError("User Does Not Exist", 404);
  // }

  // if (myUser.userRole === 'driver') {
  //   driver = true
  // }

  res.status(200).json({
    status: "success",
    data: true
  });

});

exports.login =catchAsync(async (req, res, next) => {
  console.log('User')
  if (!req.body.email) {
   throw new AppError("Please Provide Email", 400);
  }
 if (!req.body.password) {
   throw new AppError("Please Provide Password", 400);
 }
  const myUser = await User.findOne({ email: req.body.email });

  if (!myUser) {
    throw new AppError("User Does Not Exist", 404);
  }
  const validPassword=await bcrypt.compare(req.body.password,myUser.password);

  if (!validPassword ) {
    throw new AppError("Invalid Credentials.", 400);
  }
  // myUser.loc = req.body.loc
  // myUser.save();
  this.createJWTToken(myUser, 201, res);
});

exports.register = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    throw new AppError("Please Provide Email", 400);
  }
  if (!req.body.password) {
    throw new AppError("Please Provide Password", 400);
  }
  const myUser = await User.findOne({ email: req.body.email });
  if(myUser) {
    throw new AppError("Eamil Already Exist", 404);
  }
  const newUser = new User({email:req.body.email,password:req.body.password,phone:req.body.phone,firstName:req.body.firstName,lastName:req.body.lastName,userRole:req.body.userRole,});
  await newUser.save();
  res.send({
    message:"User Created Successfully",
    user:newUser
  })
});

exports.createJWTToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.verifyJWT = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in! Please login again", 401));
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("User Doesn't exist", 404));
  }
  req.user = currentUser;
  next();
});

exports.generateOtp = catchAsync(async(req,res,next) =>{
  if(!req.body.phone){
    throw new AppError("Please Provide valid Phone Number",400);
  }

  const user = await User.findOne({phone:req.body.phone});
  if (!user) {
    throw new AppError("User does not exist for this number", 400);
  }

  if (user.otp !== null && user.expiresIn != 0 && user.expiresIn > Date.now()) {
    return res.status(201).json({
      status: "successs",
      data: {
        detail: "please provide otp",
      },
    });
  }

  user.otp = Math.floor(Math.random() * (999999 - 111111) + 1) + 111111;
  user.expiresIn = Date.now() + 60000;
  await user.save();
    client.messages
      .create({
        body: `Here Is your Otp ${user.otp}.Please Do not Share It with Anyone.`,
        from: process.env.TWILIO_NUMBER,
        to: user.phone,
      })
      .then((message) => console.log(message.sid));
  return res.status(201).json({
    status: "success",
    data: {
      //Only send in Dev not in Prod.
      detail:"details of user",
    },
  });
})

exports.verifyotp = catchAsync( async(req, res, next)=>{
  if(!req.body.otp){
     throw new AppError("Please Provide otp", 400);
  }
  const user = await User.findOne({otp:req.body.otp});
  if(!user){
    throw new AppError("Please Provide valid otp", 400);
  }
  if(user.expiresIn<Date.now()){
    user.expiresIn = 0;
    user.otp = null;
    await user.save();
     throw new AppError("Otp Expired", 400);
  }
  this.createJWTToken(user,201,res);
  next();
});

exports.newpassword = catchAsync(async (req, res, next) => {
  if (req.body.password !== req.body.verifypassword) {
    throw new AppError("Password Do not Match", 400);
  }
  const _id = req.body.driver_id?req.body.driver_id:req.user._id;
  const user = await User.findOne({_id});
  if(!user){
    throw new AppError("Can't update password ,User Is unauthenticated", 403);
  };
  user.password = req.body.password;
  user.otp=null;
  user.expiresIn=0;
  await user.save();
  res.send({
    status: "success",
    newPassword: req.body.password,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const user = req.user;

  if (
    !req.body.newPassword ||
    !req.body.newConfirmPassword
  ) {
    return next(
      new AppError(
        "Please Provide new Password and Confirm Password",
        400
      )
    );
  }

  if (req.body.newPassword !== req.body.newConfirmPassword) {
    throw new AppError(
      "New Password and Confirm Password Do Not Match",
      400
    );
  }

  user.password = req.body.newPassword;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password Reset Successfully",
  });
});

exports.search = catchAsync(async (req, res, next) => {
    const { query } = req.body;
    let queries = query.split(" ");
    const fields = ["companyName", "firstName", 'lastName'];
     const orConditions = queries.map((query) =>
       fields.map((field) => ({ [field]: { $regex: query, $options: "i" } }))
     );
     const flattenedOrConditions = orConditions.reduce(
       (acc, conditions) => [...acc, { $or: conditions }],
       []
     );
      const customers = await User.aggregate([
        {
        $match: {
          userRole:"customer",
          $and: flattenedOrConditions,
        },},
        {
          $addFields: fields.reduce((fieldsToAdd, field) => {
            fieldsToAdd[field] = `$${field}`;
            return fieldsToAdd;
          }, {}),
        },
      ]);
     res.status(200).json({
       status: "success",
       data: customers
     });
});