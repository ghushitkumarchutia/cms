const User = require("../models/user.model");
const Artifact = require("../models/artifact.model");
const asyncHandler = require("../utils/asyncHandler");
const logActivity = require("../utils/logActivity");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().sort("-createdAt").lean();
  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.params.id).session(session);

    if (!user) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    await Artifact.deleteMany({ createdBy: user._id }).session(session);

    await User.findByIdAndDelete(user._id).session(session);

    await logActivity(req, {
      action: "delete",
      collectionName: "User",
      documentId: user._id,
      details: { adminAction: true, userEmail: user.email },
    });

    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: "User and their artifacts deleted successfully",
    });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});
