const User = require("../models/user.model");
const Artifact = require("../models/artifact.model");
const asyncHandler = require("../utils/asyncHandler");
const fs = require("fs");
const logActivity = require("../utils/logActivity");

exports.getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  await logActivity(req, {
    action: "update",
    collectionName: "User",
    documentId: user._id,
    details: { name: user.name, email: user.email },
  });

  res.status(200).json({ success: true, data: user });
});

exports.changePassword = asyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide old and new password" });
  }

  const user = await User.findById(req.user.id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Old password is incorrect" });
  }

  user.password = newPassword;
  await user.save();

  await logActivity(req, {
    action: "change_password",
    collectionName: "User",
    documentId: user._id,
  });

  res
    .status(200)
    .json({ success: true, message: "Password updated successfully" });
});

exports.deleteAccount = asyncHandler(async (req, res, next) => {
  const session = await User.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;

    const artifacts = await Artifact.find({ createdBy: userId }).session(
      session,
    );
    for (const artifact of artifacts) {
      if (artifact.imageUrl && fs.existsSync(artifact.imageUrl)) {
        fs.unlinkSync(artifact.imageUrl);
      }
    }

    await Artifact.deleteMany({ createdBy: userId }).session(session);

    await Artifact.updateMany(
      { likes: userId },
      { $pull: { likes: userId } },
    ).session(session);

    await Artifact.updateMany(
      { "comments.userId": userId },
      { $pull: { comments: { userId: userId } } },
    ).session(session);
    
    await User.findByIdAndDelete(userId).session(session);

    await logActivity(req, {
      action: "delete",
      collectionName: "User",
      documentId: userId,
    });

    await session.commitTransaction();
    res
      .status(200)
      .json({
        success: true,
        message: "Account and all associated data deleted",
      });
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
});
