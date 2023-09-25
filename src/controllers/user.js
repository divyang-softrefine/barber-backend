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

exports.update = catchAsync(async (req, res, next) => {
const id = req.params.id;
 const user =await User.findOne({_id:id})

  
  user.firstName = req.body.firstName;
  user.lastName = req.body.lastName;
  user.phone = req.body.phone;
  user.address = req.body.address;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "User Updated Successfully",
    data:user
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