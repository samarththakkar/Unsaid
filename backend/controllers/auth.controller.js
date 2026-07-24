const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const User = require("../models/User");
const { generateOtp } = require("../utils/generateOtp");
const { sendEmail } = require("../utils/sendEmail");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens");
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const otp = generateOtp();
    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 15;
    const otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);

    const user = await User.create({
        name,
        email,
        password,
        otp,
        otpExpiry,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken -otp");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const message = `Your email verification code is: ${otp}. It will expire in ${otpExpiryMinutes} minutes.`;
    await sendEmail({
        email: user.email,
        subject: "Verify your email",
        message,
    });

    return res.status(201).json(
        new ApiResponse(
            201, 
            createdUser, 
            "User registered successfully. Please check your email for the verification code."
        )
    );
});

const verifyEmail = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, null, "Email is already verified"));
    }

    if (user.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.otpExpiry < Date.now()) {
        throw new ApiError(400, "OTP has expired");
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
});

const resendVerificationEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.isEmailVerified) {
        return res.status(200).json(new ApiResponse(200, null, "Email is already verified"));
    }

    const otp = generateOtp();
    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 15;
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const message = `Your new email verification code is: ${otp}. It will expire in ${otpExpiryMinutes} minutes.`;
    await sendEmail({
        email: user.email,
        subject: "Verify your email",
        message,
    });

    return res.status(200).json(new ApiResponse(200, null, "Verification email resent successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (!user.isEmailVerified) {
        throw new ApiError(403, "Please verify your email before logging in");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiry");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const otp = generateOtp();
    const otpExpiryMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 15;
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + otpExpiryMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const message = `Your password reset code is: ${otp}. It will expire in ${otpExpiryMinutes} minutes.`;
    await sendEmail({
        email: user.email,
        subject: "Reset your password",
        message,
    });

    return res.status(200).json(new ApiResponse(200, null, "Password reset code sent to your email"));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        throw new ApiError(400, "Email, OTP, and new password are required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    if (user.otpExpiry < Date.now()) {
        throw new ApiError(400, "OTP has expired");
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpiry = undefined;
    // this will trigger the pre-save hook to hash the new password
    await user.save();

    return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

const googleLogin = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new ApiError(400, "Google ID Token is required");
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Register new user
            user = await User.create({
                name,
                email,
                authProvider: "google",
                googleId,
                isEmailVerified: true, // Google already verified their email
            });
        } else {
            // User exists. Update googleId if not present (account linking)
            if (user.authProvider === "local" && !user.googleId) {
                user.googleId = googleId;
                // If they hadn't verified their email locally yet, do it now
                user.isEmailVerified = true;
                await user.save({ validateBeforeSave: false });
            }
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken -otp -otpExpiry");

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        };

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser,
                        accessToken,
                        refreshToken,
                    },
                    "Google Login successful"
                )
            );
    } catch (error) {
        console.error("Google Auth Error:", error);
        throw new ApiError(401, "Invalid Google ID Token");
    }
});

module.exports = {
    registerUser,
    verifyEmail,
    resendVerificationEmail,
    loginUser,
    logoutUser,
    forgotPassword,
    resetPassword,
    googleLogin,
};
