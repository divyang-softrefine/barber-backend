const mongoose = require("mongoose");
const validator = require("validator");

const bookingSchema = new mongoose.Schema(
  {
    first_id: {
        type: mongoose.Schema.ObjectId,
    },
    userRole: {
        type: String,
        enum: ["barber", "customer"],
        default: "customer",
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
        service:[{
            name: {
                type: String,
            },
            time: {
                type: String,
            },
            price: {
                type: String,
            }
        }],
        total:{
            type:Number
        },
        second_id:{
            type: mongoose.Schema.ObjectId,
        },
    }]
  }
);
module.exports = new mongoose.model('Booking',bookingSchema)
