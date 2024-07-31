import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const CalendarSchema = mongoose.Schema({
  // start_date: {
  //   type: Date,
  //   required: true,
  //   default: new Date.now(),
  // },

  // end_date: {
  //   type: Date,
  //   required: true,
  //   default: () => new Date(Date.now() + 3600000),
  // },

  // teacher: {
  //   type: ObjectId,
  //   ref: "Teacher",
  // },

  // center: {
  //   type: ObjectId,
  //   ref: "Center",
  // },

  // address: {
  //   type: ObjectId,
  //   ref: "Address",
  // },

  name: {
    type: String,
    required: true,
  },
  bgColor: {
    type: String,
    required: true,
  },
  borderColor: {
    type: String,
    required: true,
  },
});

const Calendar = mongoose.model("Calendar", CalendarSchema);

//module.exports = Product;
export default Calendar;
