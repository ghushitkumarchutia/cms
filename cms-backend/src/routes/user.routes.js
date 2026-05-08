const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
} = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

router.use(auth);

router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.patch("/change-password", changePassword);
router.delete("/account", deleteAccount);

module.exports = router;
