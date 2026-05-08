const AuditLog = require("../models/auditLog.model");
const asyncHandler = require("../utils/asyncHandler");
const queryBuilder = require("../utils/queryBuilder");

exports.getAuditLogs = asyncHandler(async (req, res, next) => {
  const { filter, select, sort, page, limit, skip } = queryBuilder(req.query);

  const total = await AuditLog.countDocuments(filter);
  const logs = await AuditLog.find(filter)
    .select(select)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("performedBy", "name email")
    .lean();

  res.status(200).json({
    success: true,
    count: logs.length,
    total,
    pagination: { page, limit, totalPages: Math.ceil(total / limit) },
    data: logs,
  });
});

exports.getLogsByDocument = asyncHandler(async (req, res, next) => {
  const logs = await AuditLog.find({ documentId: req.params.documentId })
    .populate("performedBy", "name email")
    .sort("-createdAt")
    .lean();

  res.status(200).json({ success: true, count: logs.length, data: logs });
});
