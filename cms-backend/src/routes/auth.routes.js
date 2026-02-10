const router = require("express").Router();
const auth = require("../controllers/auth.controller");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", auth.verifyOTP);
router.post("/signup", auth.signup);
router.post("/login", auth.login);

module.exports = router;
