const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

otpSchema.pre("save", async function (next) {
  if (!this.isModified("otp")) return next();
  this.otp = await bcrypt.hash(this.otp, 10);
  next();
});

otpSchema.methods.compareOTP = async function (candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

module.exports = mongoose.model("OTP", otpSchema);
