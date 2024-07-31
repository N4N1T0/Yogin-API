import mongoose from "mongoose";

const ProductSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter a product name"],
  },

  quantity: {
    type: Number,
    required: true,
    default: 0,
  },

  price: {
    type: Number,
    required: true,
    default: 0,
  },

  image: {
    type: String,
    required: false,
  },
});

const Product = mongoose.model("Product", ProductSchema);

//module.exports = Product;
export default Product;
