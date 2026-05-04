import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: Number(process.env.EMAIL_PORT || 587),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request) {
  const body = await request.json();
  const email = body?.email?.toString().trim().toLowerCase();
  const otp = body?.otp?.toString().trim();

  if (!email || !otp) {
    return NextResponse.json({ success: false, message: "Missing email or OTP." }, { status: 400 });
  }

  if (!process.env.EMAIL_SERVER || !process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    console.error("Email configuration missing. Check EMAIL_SERVER, EMAIL_USERNAME, and EMAIL_PASSWORD.");
    return NextResponse.json({ success: false, message: "Email provider is not configured." }, { status: 500 });
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME || "no-reply@smartfarm.local";
  const subject = "SmartFarm Password Reset Code";
  const text = `Your SmartFarm password reset code is ${otp}. Use this code to reset your password.`;
  const html = `<div style="font-family: sans-serif; line-height: 1.6; color: #111;"><h2>SmartFarm Password Reset</h2><p>Your code is <strong>${otp}</strong>.</p><p>If you didn't request this, you can ignore this email.</p></div>`;

  try {
    await transporter.sendMail({
      from,
      to: email,
      subject,
      text,
      html,
    });
    return NextResponse.json({ success: true, message: "Email sent." });
  } catch (error) {
    console.error("Email send failed:", error);
    return NextResponse.json({ success: false, message: error?.message || "Unable to send email." }, { status: 500 });
  }
}
