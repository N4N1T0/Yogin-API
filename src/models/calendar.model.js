import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const CalendarSchema = mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: false, // Es opcional para los calendarios públicos
  },

  isPublic: {
    type: Boolean,
    default: false,
  },

  events: [
    {
      type: ObjectId,
      ref: "Event",
    },
  ],
});

export const Calendar = mongoose.model("Calendar", CalendarSchema);
