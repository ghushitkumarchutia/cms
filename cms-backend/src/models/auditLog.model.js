const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "create",
        "update",
        "delete",
        "login",
        "signup",
        "verify_otp",
        "change_password",
      ],
    },
    collectionName: {
      type: String,
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ip: String,
    userAgent: String,
  },
  {
    timestamps: true,
    capped: { size: 10485760, max: 5000 },
  },
);

auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
