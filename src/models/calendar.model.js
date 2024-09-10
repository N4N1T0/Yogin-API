import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const CalendarSchema = mongoose.Schema({
  teacher: {
    type: ObjectId,
    ref: "Teacher",
  },

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

export const Calendar = mongoose.model("Calendar", CalendarSchema);
