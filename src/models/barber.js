const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

const time ={
  hour:Number,
  minute:Number
}

const barberSchema = new mongoose.Schema(
  {
    owner_name:{
        type:String,
    },
    shop_name:{
        type:String,
    },
    password:{
        type:String,
    },
    email: {
      type: String,
      trim:true,
      lowercase: true
    },
    phone: [{
      type: String,
      trim:true,
    }],
    address:{
      type:String,
    },
    loc : { 
      type: [],
      default: ["", ""]
    },
    services:[{
        name:{
            type:String,
        },
        time:{
            type:String,
        },
        price:{
            type:String,
        }
    }],
    seats:{
        type:Number,
        default:0
    },
    start_time:{
      type:time
    },
    end_time:{
      type:time
    },
    verificationToken: {
      type: String
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

barberSchema.pre("save", async function (next) {
  const barber = this;
  if (barber.isModified("password")) {
    barber.password = await bcrypt.hash(barber.password, 8);
  }
  next();
});

module.exports = new mongoose.model('Barber',barberSchema)
