const express = require("express");
const router = express.Router();
const { getAllUsers, deleteUser } = require("../controllers/admin.controller");
const auth = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/rbac.middleware");
const { validateObjectId } = require("../middlewares/validators/common.validator");

router.use(auth);
router.use(authorize("admin"));

router.get("/users", getAllUsers);
router.delete("/users/:id", validateObjectId(), deleteUser);

module.exports = router;
