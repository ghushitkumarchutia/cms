const User = require("../models/user.model");
const OTP = require("../models/otp.model");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const asyncHandler = require("../utils/asyncHandler");
const logActivity = require("../utils/logActivity");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.signup = asyncHandler(async (req, res, next) => {
  const { email, password, name } = req.body;

  let user = await User.findOne({ email });
  if (user) {
    return res
      .status(400)
      .json({ success: false, message: "User already exists" });
  }

  user = await User.create({
    name,
    email,
    password,
    isVerified: false,
  });

  await logActivity(req, {
    action: "signup",
    collectionName: "User",
    documentId: user._id,
    details: { email: user.email },
  });

  res.status(201).json({
    success: true,
    message: "User registered. Please verify your email.",
    data: user,
  });
});

exports.sendOTP = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.deleteMany({ email });

  await OTP.create({ email, otp, expiresAt });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for CMS",
    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
  });

  res.status(200).json({ success: true, message: "OTP sent to email" });
});

exports.verifyOTP = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

  if (!record) {
    return res
      .status(400)
      .json({ success: false, message: "OTP not found or expired" });
  }

  const isMatch = await record.compareOTP(otp);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: "Invalid OTP" });
  }

  await User.findOneAndUpdate({ email }, { isVerified: true });

  await OTP.deleteOne({ _id: record._id });

  res
    .status(200)
    .json({ success: true, message: "Email verified successfully" });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide email and password" });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  if (!user.isVerified) {
    return res
      .status(401)
      .json({ success: false, message: "Please verify your email first" });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  await logActivity(req, {
    action: "login",
    collectionName: "User",
    documentId: user._id,
    details: { email: user.email },
  });

  res.status(200).json({ success: true, token });
});
