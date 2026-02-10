const mongoose = require("mongoose");

const bycrypt = require("bcryptjs");

const userschema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userschema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bycrypt.hash(this.password, 10);
});

module.exports = mongoose.model("User", userschema);
