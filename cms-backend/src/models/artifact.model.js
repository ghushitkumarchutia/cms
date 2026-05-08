const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const artifactSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    tags: [String],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

artifactSchema.index({ createdBy: 1, createdAt: -1 });

artifactSchema.index({ title: "text", description: "text" });

artifactSchema.virtual("likesCount").get(function () {
  return this.likes.length;
});

artifactSchema.virtual("commentsCount").get(function () {
  return this.comments.length;
});

module.exports = mongoose.model("Artifact", artifactSchema);
