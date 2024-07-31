import mongoose from "mongoose";

const mongoDBCon = mongoose
  .connect(
    "mongodb+srv://stephanie_castro:8Iqj5kROkkCdSZlM@api-yoga.wla69y8.mongodb.net/?retryWrites=true&w=majority&appName=API-Yoga"
  )
  .then(() => {
    console.log("Connected to the Mongo Data Base");
  })
  .catch(() => {
    console.log("ERROR! Cannot connect to the Data Base!");
  });

export default mongoDBCon;
