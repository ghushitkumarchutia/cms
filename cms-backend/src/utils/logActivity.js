const AuditLog = require("../models/auditLog.model");

const logActivity = async (
  req,
  { action, collectionName, documentId, details },
) => {
  try {
    await AuditLog.create({
      action,
      collectionName,
      documentId,
      performedBy: req.user ? req.user.id : documentId,
      details,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};

module.exports = logActivity;
