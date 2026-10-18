import { sendEmail } from "../config/email";

export const sendVerificationEmail = async (
  email: string,
  token: string
): Promise<void> => {
  const link =
    `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await sendEmail({
    to: email,
    subject: "Verify your NexusHire account",
    html: `
      <h2>Welcome to NexusHire!</h2>
      <p>Please verify your email address to activate your account.</p>
      <p>
        <a href="${link}">Verify Email</a>
      </p>
    `,
  });
};