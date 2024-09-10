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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    teacherId: {
      type: ObjectId,
      ref: "Teacher",
      required: true,
    },

    centerId: {
      type: ObjectId,
      ref: "center",
      required: true,
    },

    // isAllDay: {
    //   type: Boolean,
    //   default: false,
    // },

    typeYoga: {
      type: String,
      enum: ["Hatha", "Vinyasa", "Dharma", "Sivananda"], // Tipos de Yoga
      required: true,
    },

    mode: {
      type: String,
      enum: ["Online", "Presencial"],
    },

    participants: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
