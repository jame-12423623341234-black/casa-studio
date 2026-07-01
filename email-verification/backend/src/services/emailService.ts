import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("EMAIL_USER and EMAIL_PASS environment variables are required.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export default {
  async sendVerificationCode(email: string, code: string) {
    const message = {
      from: `Verification <${EMAIL_USER}>`,
      to: email,
      subject: "Your verification code",
      html: `
        <div style="font-family: Arial, sans-serif; line-height:1.5;">
          <h2>Verify your email</h2>
          <p>Use the code below to activate your account. It expires in 10 minutes.</p>
          <p style="font-size: 1.4rem; font-weight: 700;">${code}</p>
          <p>If you did not sign up, ignore this message.</p>
        </div>
      `,
    };

    await transporter.sendMail(message);
  },
};
