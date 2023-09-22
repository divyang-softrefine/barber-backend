const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const salt = bcrypt.genSaltSync(10);

const userSchema = new mongoose.Schema(
  {
    firstName:{
      type:String,
    },
    lastName:{
      type:String,
    },
    email: {
      type: String,
      trim:true,
      lowercase: true
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
      trim:true,
      unique: true, // Set the 'unique' option to true
      sparse: true, // Set the 'sparse' option to true
    },
    address:{
      type:String,
      default:""
    },
    userRole: {
      type: String,
      enum: ["admin","customer"],
      default: "customer",
    },
    otp: {
      type: String,
    },
    expiresIn: {
      type: Number,
      default: 0,
    },
    verificationToken:{
      type:String
    },
    verified:{
      type:Boolean,
      default:false
    }
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});
module.exports = new mongoose.model('User',userSchema)
