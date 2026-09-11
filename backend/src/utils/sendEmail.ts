import { resend, resendFromEmail } from "../config/email";

export const sendVerificationEmail = async (
  email: string,
  token: string
) => {
  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const result = await resend.emails.send({
    from: resendFromEmail,
    to: email,
    subject: "Verify your NexusHire account",
    html: `
      <h2>Welcome to NexusHire</h2>
      <p>Click the button below to verify your email.</p>

      <a href="${link}"
         style="padding:12px 20px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;">
        Verify Email
      </a>

      <p>Or paste this link into your browser:</p>
      <p>${link}</p>
    `,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
};