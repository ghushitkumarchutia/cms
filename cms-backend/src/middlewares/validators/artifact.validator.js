exports.validateArtifact = (req, res, next) => {
  const { title, status, tags } = req.body;
  const errors = [];

  if (req.method === "POST" && (!title || title.trim().length === 0)) {
    errors.push("Title is required");
  }

  if (status && !["draft", "published"].includes(status)) {
    errors.push("Status must be either 'draft' or 'published'");
  }

  if (tags && !Array.isArray(tags)) {
    errors.push("Tags must be an array of strings");
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

exports.validateComment = (req, res, next) => {
  const { text } = req.body;
  if (!text || text.trim().length === 0) {
    return res.status(400).json({ success: false, message: "Comment text is required" });
  }
  next();
};
