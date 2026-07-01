import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;
const VERIFICATION_EXPIRES_MINUTES = 10;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is required in environment variables.");
}

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default {
  generateVerificationCode() {
    return generateRandomCode();
  },

  async findUserByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase().trim() });
  },

  async createUser({
    name,
    email,
    password,
    verificationCode,
  }: {
    name: string;
    email: string;
    password: string;
    verificationCode: string;
  }) {
    const passwordHash = await bcrypt.hash(password, 12);
    const verificationCodeHash = await bcrypt.hash(verificationCode, 10);
    const verificationCodeExpires = new Date(Date.now() + VERIFICATION_EXPIRES_MINUTES * 60 * 1000);

    return User.create({
      name,
      email: email.toLowerCase().trim(),
      password: passwordHash,
      isVerified: false,
      verificationCodeHash,
      verificationCodeExpires,
    });
  },

  async updateVerificationCode(email: string, code: string) {
    const verificationCodeHash = await bcrypt.hash(code, 10);
    const verificationCodeExpires = new Date(Date.now() + VERIFICATION_EXPIRES_MINUTES * 60 * 1000);

    return User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { verificationCodeHash, verificationCodeExpires },
      { new: true }
    );
  },

  async verifyCode(email: string, code: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.isVerified) {
      return { success: false, message: "Account already verified." };
    }

    if (!user.verificationCodeHash || !user.verificationCodeExpires) {
      return { success: false, message: "No verification code was issued." };
    }

    if (user.verificationCodeExpires.getTime() < Date.now()) {
      return { success: false, message: "Verification code has expired." };
    }

    const isMatch = await bcrypt.compare(code, user.verificationCodeHash);

    if (!isMatch) {
      return { success: false, message: "Incorrect verification code." };
    }

    user.isVerified = true;
    user.verificationCodeHash = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    return { success: true };
  },

  async authenticateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }

    if (!user.isVerified) {
      return { success: false, message: "Email not verified. Please verify your account first." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { success: false, message: "Invalid email or password." };
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
      expiresIn: "8h",
    });

    return { success: true, token };
  },
};
