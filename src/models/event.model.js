import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const eventSchema = new mongoose.Schema(
  {
    calendarId: {
      type: ObjectId,
      ref: "Calendar",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
