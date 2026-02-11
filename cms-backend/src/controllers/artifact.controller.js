const Artifact = require("../models/artifact.model");
const { sendArtifactWebhook } = require("../utils/webhookSender");

exports.createArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.create({
      ...req.body,
      createdBy: req.user.id,
    });

    sendArtifactWebhook(artifact);

    res.json(artifact);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating artifact", error: error.message });
  }
};

exports.getArtifacts = async (req, res) => {
  try {
    const artifacts = await Artifact.find().populate("createdBy", "email");
    res.json(artifacts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching artifacts", error: error.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);

    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    const alreadyLiked = artifact.likes.some((id) =>
      typeof id.equals === "function"
        ? id.equals(userId)
        : id.toString() === String(userId),
    );

    if (alreadyLiked) {
      artifact.likes.pull(userId);
    } else {
      artifact.likes.push(userId);
    }

    await artifact.save();

    res.json({
      message: alreadyLiked ? "Unliked" : "Liked",
      totalLikes: artifact.likes.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLikes = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id).populate(
      "likes",
      "name email",
    );

    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    res.json({
      totalLikes: artifact.likes.length,
      users: artifact.likes,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const userId = req.user && (req.user.id || req.user._id);
    const { text } = req.body;

    if (!text || !String(text).trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const artifact = await Artifact.findById(req.params.id);
    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    artifact.comments.push({ userId, text: String(text).trim() });
    await artifact.save();

    await artifact.populate("comments.userId", "name email");

    res.json({ message: "Comment added", comments: artifact.comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const artifact = await Artifact.findById(req.params.id).populate(
      "comments.userId",
      "name email",
    );

    if (!artifact) {
      return res.status(404).json({ message: "Artifact not found" });
    }

    res.json({
      totalComments: artifact.comments.length,

      comments: artifact.comments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
