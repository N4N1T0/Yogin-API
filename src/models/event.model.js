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
      ref: "Center",
      required: false, // Opcional
    },
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
    link: {
      type: String,
      required: function () {
        return this.mode === "Online";
      }, // Obligatorio si el modo es Online
    },
    address: {
      type: ObjectId,
      ref: "Address",
      required: function () {
        return this.mode === "Presencial" && !this.centerId;
      }, // Obligatorio si el modo es Presencial y no se ha seleccionado un centro
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
