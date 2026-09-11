import { resend, resendFromEmail } from "../config/email";

export const sendResetPasswordEmail = async (
  email: string,
  link: string
) => {
  const result = await resend.emails.send({
    from: resendFromEmail,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>

      <p>Click below to reset your password.</p>

      <a href="${link}"
         style="padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;">
        Reset Password
      </a>

      <p>${link}</p>
    `,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
};