import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoDBCon = mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to the Mongo Data Base");
  })
  .catch(() => {
    console.log("ERROR! Cannot connect to the Data Base!");
  });

export default mongoDBCon;
