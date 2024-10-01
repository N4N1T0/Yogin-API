import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const StudentSchema = mongoose.Schema({
  user: {
    type: ObjectId,
    ref: "User",
    required: true,
  },

  //styles: {
  // type: Array
  //}
});

export const Student = mongoose.model("Student", StudentSchema);
