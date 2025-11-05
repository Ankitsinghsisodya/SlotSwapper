import type { SendMailOptions } from "nodemailer";
import nodemailer, { type Transporter } from "nodemailer";

const transporter: Transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendEmail(email: string, otp: number) {
  try {
    const mailOptions: SendMailOptions = {
      from: `"SlotSwapper" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: "🔐 Your Verification Code",
      text: `Your verification code is ${otp}. It will expire in 10 minutes.`,
      html: `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px 20px;">
        
        <!-- Header Section -->
        <div style="text-align: center; margin-bottom: 40px;">
          <div style="background: #e8f0fe; width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: inline-flex; align-items: center; justify-content: center;">
            <svg width="40" height="40" fill="#1a73e8" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V9h14v10zm0-12H5V5h14v2zM7 11h5v5H7z"/>
            </svg>
          </div>
          <h1 style="color: #202124; font-size: 28px; font-weight: 400; margin: 0; letter-spacing: -0.5px;">SlotSwapper</h1>
          <p style="color: #5f6368; font-size: 16px; margin: 8px 0 0 0; font-weight: 400;">Verification Code</p>
        </div>

        <!-- Main Content -->
        <div style="background: white; padding: 32px; border: 1px solid #dadce0; border-radius: 8px; margin-bottom: 24px;">
          
          <div style="text-align: center; margin-bottom: 32px;">
            <h2 style="color: #202124; font-size: 24px; font-weight: 400; margin: 0 0 16px 0;">Verify your email</h2>
            <p style="color: #5f6368; font-size: 14px; line-height: 1.6; margin: 0;">
              Enter the following verification code to complete your sign up. 
              This code will expire in <strong style="color: #d93025;">10 minutes</strong>.
            </p>
          </div>

          <!-- OTP Display -->
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background: #1a73e8; color: white; font-size: 32px; font-weight: 500; letter-spacing: 0.5em; padding: 16px 32px; border-radius: 4px; box-shadow: 0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15);">
              ${otp}
            </div>
          </div>

          <!-- Security Notice -->
          <div style="background: #e8f0fe; border-left: 4px solid #1a73e8; border-radius: 4px; padding: 16px; margin: 32px 0;">
            <div style="display: flex; align-items: flex-start;">
              <div style="margin-right: 12px; margin-top: 2px;">
                <svg width="20" height="20" fill="#1a73e8" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <div>
                <h3 style="color: #1967d2; font-size: 14px; font-weight: 500; margin: 0 0 8px 0;">Security tips</h3>
                <ul style="color: #202124; font-size: 13px; margin: 0; padding-left: 16px; line-height: 1.5;">
                  <li>Never share this code with anyone</li>
                  <li>SlotSwapper will never ask for your code via phone or email</li>
                  <li>If you didn't request this code, please ignore this email</li>
                </ul>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 32px;">
            <p style="color: #5f6368; font-size: 13px; margin: 0;">
              Didn't request this code? You can safely ignore this email. 
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #dadce0;">
          <p style="color: #5f6368; font-size: 12px; margin: 0 0 8px 0;">
            This email was sent by SlotSwapper
          </p>
          <p style="color: #80868b; font-size: 11px; margin: 0;">
            © ${new Date().getFullYear()} SlotSwapper. All rights reserved.
          </p>
          <div style="margin-top: 16px;">
            <a href="#" style="color: #1a73e8; text-decoration: none; font-size: 11px; margin: 0 8px;">Help</a>
            <span style="color: #dadce0;">|</span>
            <a href="#" style="color: #1a73e8; text-decoration: none; font-size: 11px; margin: 0 8px;">Privacy</a>
            <span style="color: #dadce0;">|</span>
            <a href="#" style="color: #1a73e8; text-decoration: none; font-size: 11px; margin: 0 8px;">Terms</a>
          </div>
        </div>

      </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Message sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email: ", error);
    return { success: false, error };
  }
}
