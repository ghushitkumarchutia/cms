const Artifact = require("../models/artifact.model");

exports.createArtifact = async (req, res) => {
  try {
    const artifact = await Artifact.create({
      ...req.body,
      createdBy: req.user.id,
    });
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
