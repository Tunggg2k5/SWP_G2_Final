import nodemailer from "nodemailer";
import { env } from "../config/environment.js";

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);
}

export async function sendPasswordResetOtp({ to, fullName, otp, ttlMinutes }) {
  if (!hasSmtpConfig()) {
    return { sent: false };
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to,
    subject: "Mã OTP đặt lại mật khẩu SmileCare",
    text: [
      `Xin chào ${fullName || "bạn"},`,
      "",
      `Mã OTP đặt lại mật khẩu SmileCare của bạn là: ${otp}`,
      `Mã có hiệu lực trong ${ttlMinutes} phút.`,
      "",
      "Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này."
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #0284c7; margin-top: 0;">SmileCare</h2>
        <p>Xin chào <strong>${fullName || "bạn"}</strong>,</p>
        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản SmileCare. Mã xác thực OTP của bạn là:</p>
        <div style="background: #f0f9ff; padding: 16px; text-align: center; border-radius: 8px; margin: 20px 0; border: 1px dashed #0284c7;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0284c7;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">Mã có hiệu lực trong <strong>${ttlMinutes} phút</strong>.</p>
        <p style="color: #94a3b8; font-size: 13px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 12px;">
          Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này để bảo vệ an toàn tài khoản.
        </p>
      </div>
    `
  });

  return { sent: true };
}
