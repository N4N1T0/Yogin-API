import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  entry_date: {
    type: Date,
    //required: true,
    default: new Date().now,
  },

  image: {
    type: String,
    required: false,
  },
});

// Middleware para hacer hash a la contraseña antes de guardarla
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", UserSchema);
