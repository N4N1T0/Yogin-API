import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const ClassSchema = mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: new Date().now,
  },

  calendar: {
    type: ObjectId,
    ref: "Calendar",
  },

  user: {
    type: ObjectId,
    ref: "User",
    //status: ["reservado" | "confirmada" | "cancelada"], ?
  },

  description: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    enum: ["evento", "clase"],
    required: true,
  },

  state: {
    type: String,
    enum: ["ok", "ko"],
  },
});

const Class = mongoose.model("Class", ClassSchema);

//module.exports = Product;
export default Class;
