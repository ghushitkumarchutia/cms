const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const { validateSignup, validateLogin, validateOTP } = require("../middlewares/validators/auth.validator");

router.post("/send-otp", auth.sendOTP);
router.post("/verify-otp", validateOTP, auth.verifyOTP);
router.post("/signup", validateSignup, auth.signup);
router.post("/login", validateLogin, auth.login);

module.exports = router;
