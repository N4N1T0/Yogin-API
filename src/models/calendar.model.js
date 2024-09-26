import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const CalendarSchema = mongoose.Schema({
  roleType: {
    type: String,
    required: true,
    enum: ["teacher", "student", "center", "public"], // Incluye 'Public' como opción
  },

  user: {
    type: ObjectId,
    required: function () {
      return this.roleType !== "public"; // El campo 'user' solo es requerido si no es 'Public'
    },
    ref: "User",
  },

  events: [
    {
      type: ObjectId,
      ref: "Event",
    },
  ],
});

export const Calendar = mongoose.model("Calendar", CalendarSchema);
