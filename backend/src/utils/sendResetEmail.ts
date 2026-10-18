import { sendEmail } from "../config/email";

export const sendResetPasswordEmail = async (
  email: string,
  link: string
): Promise<void> => {
  await sendEmail({
    to: email,
    subject: "Reset your NexusHire password",
    html: `
      <h2>Password Reset</h2>
      <p>You requested a password reset.</p>
      <p><a href="${link}">Reset Password</a></p>
      <p>If you did not request this, ignore this email.</p>
    `,
  });
};