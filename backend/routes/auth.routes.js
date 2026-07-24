const express = require("express");
const { 
    registerUser, 
    verifyEmail,
    resendVerificationEmail,
    loginUser, 
    logoutUser,
    forgotPassword,
    resetPassword
} = require("../controllers/auth.controller");
const { verifyJWT } = require("../middleware/authUser");

const router = express.Router();

// Authentication & Verification
router.route("/register").post(registerUser);
router.route("/verify-email").post(verifyEmail);
router.route("/resend-verification").post(resendVerificationEmail);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

// Password Management
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

module.exports = router;
