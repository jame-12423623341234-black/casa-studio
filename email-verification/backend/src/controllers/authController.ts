import { Request, Response } from "express";
import validator from "validator";
import authService from "../services/authService.js";
import emailService from "../services/emailService.js";

function validateGmail(email: string) {
  return validator.isEmail(email) && email.toLowerCase().endsWith("@gmail.com");
}

function validatePassword(password: string) {
  return typeof password === "string" && password.length >= 8;
}

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Name is required." });
  }

  if (!validateGmail(email)) {
    return res.status(400).json({ error: "Please provide a valid Gmail address." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const existingUser = await authService.findUserByEmail(email);

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const verificationCode = authService.generateVerificationCode();
    const user = await authService.createUser({ name, email, password, verificationCode });

    await emailService.sendVerificationCode(email, verificationCode);

    return res.status(201).json({
      message: "Registration successful. A verification code was sent to your Gmail address.",
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to register user." });
  }
}

export async function verifyAccount(req: Request, res: Response) {
  const { email, code } = req.body;

  if (!validateGmail(email)) {
    return res.status(400).json({ error: "Please provide a valid Gmail address." });
  }

  if (!/^[0-9]{6}$/.test(code)) {
    return res.status(400).json({ error: "Verification code must be 6 digits." });
  }

  try {
    const verificationResult = await authService.verifyCode(email, code);

    if (!verificationResult.success) {
      return res.status(400).json({ error: verificationResult.message });
    }

    return res.json({ message: "Account verified successfully. You may now log in." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to verify account." });
  }
}

export async function resendVerificationCode(req: Request, res: Response) {
  const { email } = req.body;

  if (!validateGmail(email)) {
    return res.status(400).json({ error: "Please provide a valid Gmail address." });
  }

  try {
    const user = await authService.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: "Account is already verified." });
    }

    const code = authService.generateVerificationCode();
    await authService.updateVerificationCode(user.email, code);
    await emailService.sendVerificationCode(user.email, code);

    return res.json({ message: "A new verification code was sent to your Gmail address." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to resend verification code." });
  }
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!validateGmail(email)) {
    return res.status(400).json({ error: "Please provide a valid Gmail address." });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    const loginResult = await authService.authenticateUser(email, password);

    if (!loginResult.success) {
      return res.status(401).json({ error: loginResult.message });
    }

    return res.json({ token: loginResult.token, message: "Login successful." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to login." });
  }
}
