const Barber = require("../models/barber");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { promisify } = require("util");
const { createJWTToken } = require("./user")
const crypto = require('crypto')
const nodemailer = require('nodemailer');

function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Send a verification email to the user
async function sendVerificationEmail(user, character) {
    const token = generateVerificationToken();
    user.verificationToken = token;
    await user.save();

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        service: "gmail",
        auth: {
            // should be replaced with real sender's account
            user: "infoleave.softrefine@gmail.com",
            pass: "teagzavneplqhjjt",
        },
    });

    const verificationLink = `http://localhost:4200/verify?token=${token}&character=${character}`;

    const mailOptions = {
        to: user.email,
        subject: 'Email Verification',
        html: `Please click the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a>`,
    };

    await transporter.sendMail(mailOptions)
}

exports.sendEmail = catchAsync(async (req, res, next) => {
    const email=req.body.email;
    const character = req.body.character;
    if (!req.body.email) {
        throw new AppError("Please Provide Email", 400);
    }
    let user ;
    if (character ==='User'){
        user = await User.findOne({ email });
        if (user) {
            if(user.verified===true)
            throw new AppError("User Already Exist", 400);
        }else{
            user = new User({email:req.body.email});
        }
    }else{
        user = await Barber.findOne({ email });
        if (user) {
            if (user.verified === true)
            throw new AppError("Barber Already Exist", 400);
        }else{
            user = new Barber({ email: req.body.email });
        }
        
    }
    
    await sendVerificationEmail(user, character);
        
    res.send({
        message:"Message sent successfully"
    })
})

exports.verifyEmail = catchAsync(async (req, res, next) => {

    const { token, character } = req.query;
    if (!token) {
        throw new AppError('Invalid token',400);
    }
    let user;
    if(character==='User'){
        user = await User.findOne({ verificationToken: token });
        if (!user) {
            throw new AppError('Token Expired',400);
        }
    }else{
        user = await Barber.findOne({ verificationToken: token })
        if (!user) {
            throw new AppError('Token Expired',400);
        }
    }
    
    // Mark the user as verified and clear the verification token
    if (!user.verified){
        user.verified = true;
        await user.save();
        return res.send({
            process: "email",
            message: "Email Verified"
        });
    }

    // Redirect or provide a confirmation message of after fist time email verfication user agian hit it and pass not setup
   if(!user.password){
      return res.send({
           process: "password",
           message: "Please Setup Password"
       });
   }

    user.verificationToken=null;
    await user.save();
    // Redirect or provide a confirmation message of first time email verfication
   return res.send({
        process:"complete",
        message:"user Verified Successfully"
    });
})

exports.setpassword = catchAsync(async (req, res, next) => {
    const {pass1,pass2,token}=req.body;

    if(!pass1 || !pass2 || !token) {
        throw new AppError("Data is Missing", 400);
    }

    if (pass1!== pass2) {
        throw new AppError("Password Do not match", 400);
    }
  
    const data = token.split('&');
  
    data[0]=data[0].split('token=')[1];
    data[1] = data[1].split('character=')[1];
   
    let user ;
    if(data[1]==='User'){
        user =await User.findOne({verificationToken:data[0]});
        if(!user){
            throw new AppError("User is Restricted", 400);
        }
    }else{
        user =await Barber.findOne({ verificationToken: data[0] });
        if (!user) {
            throw new AppError("Barber is Restricted", 400);
        }
    }
    user.password =pass1;
    await user.save();

    res.send({
        message:"Password Updated Successfully",
        status:"success"
    })
})