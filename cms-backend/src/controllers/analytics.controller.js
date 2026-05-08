const Artifact = require("../models/artifact.model");
const asyncHandler = require("../utils/asyncHandler");

exports.getOverviewStats = asyncHandler(async (req, res, next) => {
  const stats = await Artifact.aggregate([
    {
      $group: {
        _id: null,
        totalArtifacts: { $sum: 1 },
        totalLikes: { $sum: { $size: "$likes" } },
        totalComments: { $sum: { $size: "$comments" } },
      },
    },
    {
      $lookup: {
        from: "users",
        pipeline: [{ $count: "totalUsers" }],
        as: "userCount",
      },
    },
    {
      $project: {
        _id: 0,
        totalArtifacts: 1,
        totalLikes: 1,
        totalComments: 1,
        totalUsers: { $arrayElemAt: ["$userCount.totalUsers", 0] },
      },
    },
  ]);

  res.status(200).json({ success: true, data: stats[0] || {} });
});

exports.getTopArtifacts = asyncHandler(async (req, res, next) => {
  const topArtifacts = await Artifact.aggregate([
    {
      $addFields: {
        likesCount: { $size: "$likes" },
      },
    },
    { $sort: { likesCount: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "author",
      },
    },
    { $unwind: "$author" },
    {
      $project: {
        title: 1,
        likesCount: 1,
        "author.name": 1,
        "author.email": 1,
        createdAt: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: topArtifacts });
});

exports.getActiveUsers = asyncHandler(async (req, res, next) => {
  const activeUsers = await Artifact.aggregate([
    { $unwind: "$likes" },
    {
      $group: {
        _id: "$likes",
        likesGiven: { $sum: 1 },
      },
    },
    { $sort: { likesGiven: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        _id: 1,
        likesGiven: 1,
        "user.name": 1,
        "user.email": 1,
      },
    },
  ]);

  res.status(200).json({ success: true, data: activeUsers });
});

exports.getArtifactsByDateRange = asyncHandler(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const matchStage = {};
  if (startDate && endDate) {
    matchStage.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const trend = await Artifact.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.status(200).json({ success: true, data: trend });
});

exports.getTagDistribution = asyncHandler(async (req, res, next) => {
  const distribution = await Artifact.aggregate([
    { $unwind: "$tags" },
    {
      $group: {
        _id: "$tags",
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json({ success: true, data: distribution });
});
