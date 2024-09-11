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
      enum: ["Hatha", "Vinyasa", "Dharma", "Sivananda", "Kundalini"], // Tipos de Yoga
      required: true,
    },

    mode: {
      type: String,
      enum: ["Online", "Presencial"],
      required: true,
    },

    participants: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
