import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const CenterSchema = mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  // address: {
  //   type: ObjectId,
  //   ref: "Adress",
  // },

  // name: {
  //   type: String,
  //   required: true,
  // },

  // logo: {
  //   type: String,
  //   required: true,
  // },

  // url: {
  //   type: String,
  //   required: false,
  // },
});

export const Center = mongoose.model("Center", CenterSchema);
