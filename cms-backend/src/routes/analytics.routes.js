const express = require("express");
const router = express.Router();
const {
  getOverviewStats,
  getTopArtifacts,
  getActiveUsers,
  getArtifactsByDateRange,
  getTagDistribution,
} = require("../controllers/analytics.controller");
const auth = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/rbac.middleware");

router.use(auth);
router.use(authorize("admin"));

router.get("/overview", getOverviewStats);
router.get("/top-artifacts", getTopArtifacts);
router.get("/active-users", getActiveUsers);
router.get("/artifacts-by-date", getArtifactsByDateRange);
router.get("/tag-distribution", getTagDistribution);

module.exports = router;
