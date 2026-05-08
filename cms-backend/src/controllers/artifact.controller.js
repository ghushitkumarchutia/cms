const Artifact = require("../models/artifact.model");
const asyncHandler = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const fs = require("fs");
const queryBuilder = require("../utils/queryBuilder");
const logActivity = require("../utils/logActivity");

exports.createArtifact = asyncHandler(async (req, res, next) => {
  const artifactData = { ...req.body };
  if (req.file) {
    artifactData.imageUrl = req.file.path;
  }

  const artifact = await Artifact.create({
    ...artifactData,
    createdBy: req.user.id,
  });

  await logActivity(req, {
    action: "create",
    collectionName: "Artifact",
    documentId: artifact._id,
    details: { title: artifact.title },
  });

  res.status(201).json({ success: true, data: artifact });
});

exports.getArtifacts = asyncHandler(async (req, res, next) => {
  const { filter, select, sort, page, limit, skip } = queryBuilder(req.query);

  const total = await Artifact.countDocuments(filter);
  const artifacts = await Artifact.find(filter)
    .select(select)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email")
    .lean();

  res.status(200).json({
    success: true,
    count: artifacts.length,
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data: artifacts,
  });
});

exports.getMyArtifacts = asyncHandler(async (req, res, next) => {
  const { filter, select, sort, page, limit, skip } = queryBuilder(req.query);
  filter.createdBy = req.user.id;

  const total = await Artifact.countDocuments(filter);
  const artifacts = await Artifact.find(filter)
    .select(select)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .lean();

  res.status(200).json({
    success: true,
    count: artifacts.length,
    total,
    pagination: { page, limit, totalPages: Math.ceil(total / limit) },
    data: artifacts,
  });
});

exports.searchArtifacts = asyncHandler(async (req, res, next) => {
  const { filter, select, sort, page, limit, skip } = queryBuilder(req.query);

  if (!req.query.search) {
    return res.status(400).json({ success: false, message: "Please provide a search term" });
  }

  const textSort = req.query.sort ? sort : { score: { $meta: "textScore" } };

  const total = await Artifact.countDocuments(filter);
  const artifacts = await Artifact.find(filter)
    .select(`${select} score`)
    .sort(textSort)
    .skip(skip)
    .limit(limit)
    .populate("createdBy", "name email")
    .lean();

  res.status(200).json({
    success: true,
    count: artifacts.length,
    total,
    data: artifacts,
  });
});

exports.toggleLike = asyncHandler(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Artifact ID" });
  }

  const userId = req.user.id;
  const artifact = await Artifact.findById(req.params.id);

  if (!artifact) {
    return res
      .status(404)
      .json({ success: false, message: "Artifact not found" });
  }

  const alreadyLiked = artifact.likes.includes(userId);

  const update = alreadyLiked
    ? { $pull: { likes: userId } }
    : { $addToSet: { likes: userId } };

  const updatedArtifact = await Artifact.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true },
  );

  res.status(200).json({
    success: true,
    message: alreadyLiked ? "Unliked" : "Liked",
    totalLikes: updatedArtifact.likes.length,
  });
});

exports.getLikes = asyncHandler(async (req, res, next) => {
  const artifact = await Artifact.findById(req.params.id)
    .populate("likes", "name email")
    .lean();

  if (!artifact) {
    return res
      .status(404)
      .json({ success: false, message: "Artifact not found" });
  }

  res.status(200).json({
    success: true,
    totalLikes: artifact.likes.length,
    users: artifact.likes,
  });
});

exports.addComment = asyncHandler(async (req, res, next) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Comment text is required" });
  }

  const artifact = await Artifact.findByIdAndUpdate(
    req.params.id,
    { $push: { comments: { userId: req.user.id, text: text.trim() } } },
    { new: true, runValidators: true },
  ).populate("comments.userId", "name email");

  if (!artifact) {
    return res
      .status(404)
      .json({ success: false, message: "Artifact not found" });
  }

  res.status(200).json({
    success: true,
    message: "Comment added",
    comments: artifact.comments,
  });
});

exports.getComments = asyncHandler(async (req, res, next) => {
  const artifact = await Artifact.findById(req.params.id)
    .populate("comments.userId", "name email")
    .lean();

  if (!artifact) {
    return res
      .status(404)
      .json({ success: false, message: "Artifact not found" });
  }

  res.status(200).json({
    success: true,
    totalComments: artifact.comments.length,
    comments: artifact.comments,
  });
});

exports.updateArtifact = asyncHandler(async (req, res, next) => {
  let artifact = await Artifact.findById(req.params.id);

  if (!artifact) {
    return res
      .status(404)
      .json({ success: false, message: "Artifact not found" });
  }

  if (
    artifact.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to update this artifact",
    });
  }

  const updateData = { ...req.body };
  if (req.file) {
    if (artifact.imageUrl && fs.existsSync(artifact.imageUrl)) {
      fs.unlinkSync(artifact.imageUrl);
    }
    updateData.imageUrl = req.file.path;
  }

  artifact = await Artifact.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  await logActivity(req, {
    action: "update",
    collectionName: "Artifact",
    documentId: artifact._id,
    details: { title: artifact.title },
  });

  res.status(200).json({ success: true, data: artifact });
});

exports.deleteArtifact = asyncHandler(async (req, res, next) => {
  const artifact = await Artifact.findById(req.params.id);

  if (!artifact) {
    return res
      .status(404)
      .json({ success: false, message: "Artifact not found" });
  }

  if (
    artifact.createdBy.toString() !== req.user.id &&
    req.user.role !== "admin"
  ) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to delete this artifact",
    });
  }

  if (artifact.imageUrl && fs.existsSync(artifact.imageUrl)) {
    fs.unlinkSync(artifact.imageUrl);
  }

  const artifactId = artifact._id;
  const artifactTitle = artifact.title;

  await artifact.deleteOne();

  await logActivity(req, {
    action: "delete",
    collectionName: "Artifact",
    documentId: artifactId,
    details: { title: artifactTitle },
  });

  res
    .status(200)
    .json({ success: true, message: "Artifact deleted successfully" });
});
