const router = require("express").Router();
const ctrl = require("../controllers/artifact.controller");
const auth = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const { validateArtifact, validateComment } = require("../middlewares/validators/artifact.validator");
const { validateObjectId } = require("../middlewares/validators/common.validator");

router.use(auth);

router.get("/", ctrl.getArtifacts);
router.get("/me", ctrl.getMyArtifacts);
router.get("/search", ctrl.searchArtifacts);

router.post("/", upload.single("image"), validateArtifact, ctrl.createArtifact);

router.patch("/:id", validateObjectId(), upload.single("image"), validateArtifact, ctrl.updateArtifact);
router.delete("/:id", validateObjectId(), ctrl.deleteArtifact);

router.post("/:id/like", validateObjectId(), ctrl.toggleLike);
router.get("/:id/likes", validateObjectId(), ctrl.getLikes);

router.post("/:id/comment", validateObjectId(), validateComment, ctrl.addComment);
router.get("/:id/comments", validateObjectId(), ctrl.getComments);

module.exports = router;
