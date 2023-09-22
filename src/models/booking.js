const mongoose = require("mongoose");
const validator = require("validator");

const bookingSchema = new mongoose.Schema(
  {
    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: "users",
    },
    bookings:[{
        start_time:{
            type:Date,
            required:true
        },
        end_time:{
            type:Date,
            required:true
        },
        total:{
            type:Number
        },
    }]
  }
);
module.exports = new mongoose.model('Booking',bookingSchema)
