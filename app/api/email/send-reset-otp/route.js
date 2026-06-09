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
      subject: "FarmPulse — Password Reset Code",
      text: `Your FarmPulse password reset code is: ${otp}\n\nThis code will expire in 3 minutes.\n\nIf you did not request this code, please ignore this email and your account will remain secure.`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #31572C;">
                <h1 style="color: #31572C; margin: 0; font-size: 24px;">FarmPulse</h1>
              </div>
              
              <div style="padding: 40px 20px;">
                <h2 style="color: #333; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
                <p style="font-size: 16px; color: #555;">We received a request to reset your FarmPulse account password. Use the OTP code below to proceed:</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #31572C; padding: 20px; margin: 30px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 14px; color: #666;">Your OTP code:</p>
                  <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; color: #31572C; letter-spacing: 2px; text-align: center;">${otp}</p>
                </div>
                
                <p style="font-size: 14px; color: #999; margin: 20px 0;">
                  <strong>⏱️ OTP code expires in 3 minutes</strong><br>
                  Do not share this code with anyone.
                </p>
                
                <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
                  <p style="margin: 0; font-size: 13px; color: #856404;">
                    <strong>⚠️ Didn't request this?</strong><br>
                    If you didn't request a password reset, you can safely ignore this email.
                  </p>
                </div>
              </div>
              
              <div style="border-top: 2px solid #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p style="margin: 0;">© 2026 FarmPulse. All rights reserved.</p>
              </div>
            </div>
          </body>
        </html>
      `,
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
