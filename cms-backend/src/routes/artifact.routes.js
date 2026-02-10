const router = require("express").Router();
const ctrl = require("../controllers/artifact.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/", auth, ctrl.createArtifact);
router.get("/", auth, ctrl.getArtifacts);

module.exports = router;
