import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

function parseBoolean(value) {
  return String(value).toLowerCase() === "true";
}

function getEmailConfig() {
  return {
    host: process.env.EMAIL_SERVER,
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: parseBoolean(process.env.EMAIL_SECURE),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  };
}

async function sendEmailWithRetry(transporter, mailOptions, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  return { success: false, error: lastError };
}

function getErrorMessage(error, isDevelopment) {
  if (isDevelopment) {
    return `SMTP Error: ${error.message}`;
  }
  return "Failed to send verification code. Please try again later.";
}

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: "Missing email or OTP in request payload." },
        { status: 400 }
      );
    }

    const emailConfig = getEmailConfig();
    if (!emailConfig.host || !emailConfig.auth.user || !emailConfig.auth.pass) {
      return NextResponse.json(
        { success: false, message: "Email provider is not configured. Check SMTP environment variables." },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport(emailConfig);
    const from = process.env.EMAIL_FROM || process.env.EMAIL_USERNAME;
    const mailOptions = {
      from,
      to: email,
      subject: "SmartFarm password reset code",
      text: `Your SmartFarm password reset code is ${otp}. It expires in 3 minutes.`,
      html: `<p>Your SmartFarm password reset code is <strong>${otp}</strong>.</p><p>This code expires in 3 minutes.</p>`,
    };

    const result = await sendEmailWithRetry(transporter, mailOptions);

    if (!result.success) {
      const isDev = process.env.NODE_ENV === "development";
      const message = getErrorMessage(result.error, isDev);
      console.error("Email send failed after retries:", result.error);
      return NextResponse.json({ success: false, message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Verification code sent." });
  } catch (error) {
    console.error("Error sending reset OTP email:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send verification code. Please try again later." },
      { status: 500 }
    );
  }
}
