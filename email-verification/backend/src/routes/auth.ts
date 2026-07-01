import express from "express";
import validateRequest from "../middleware/validateRequest.js";
import {
  login,
  register,
  resendVerificationCode,
  verifyAccount,
} from "../controllers/authController.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(["name", "email", "password"]),
  register
);
router.post(
  "/verify",
  validateRequest(["email", "code"]),
  verifyAccount
);
router.post(
  "/resend-verification",
  validateRequest(["email"]),
  resendVerificationCode
);
router.post(
  "/login",
  validateRequest(["email", "password"]),
  login
);

export default router;
