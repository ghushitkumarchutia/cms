const express = require("express");
const router = express.Router();
const { getAuditLogs, getLogsByDocument } = require("../controllers/auditLog.controller");
const auth = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/rbac.middleware");
const { validateObjectId } = require("../middlewares/validators/common.validator");

router.use(auth);
router.use(authorize("admin"));

router.get("/", getAuditLogs);
router.get("/:documentId", validateObjectId("documentId"), getLogsByDocument);

module.exports = router;
