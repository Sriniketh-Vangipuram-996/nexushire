import nodemailer from "nodemailer";

/**
 * Sends a password reset email to the user
 * @param email - user's email
 * @param link - full URL to reset password page (frontend)
 */
export const sendResetPasswordEmail = async (email: string, link: string) => {
  try {
    // create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail", // you can use any SMTP service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls:{
        rejectUnauthorized:false,
      }
    });

    // send the email
    await transporter.sendMail({
      from: `"NexusHire" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset. Click the link below to set a new password:</p>
        <a href="${link}">Reset Password</a>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });

    console.log(`Password reset email sent to ${email}`);
  } catch (err) {
    console.error("Reset email failed:", err);
  }
};
