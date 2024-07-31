import mongoose from "mongoose";

const AddressSchema = mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});

const Address = mongoose.model("Address", AddressSchema);

//module.exports = Product;
export default Address;
