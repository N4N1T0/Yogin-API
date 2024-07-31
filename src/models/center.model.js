import mongoose from "mongoose";

const CenterSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  logo: {
    type: String,
    required: true,
  },

  url: {
    type: String,
    required: false,
  },
});

const Center = mongoose.model("Center", CenterSchema);

//module.exports = Product;
export default Center;
