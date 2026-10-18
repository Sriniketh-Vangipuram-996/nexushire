const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_FROM_EMAIL = process.env.BREVO_FROM_EMAIL;

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not configured");
}

if (!BREVO_FROM_EMAIL) {
  throw new Error("BREVO_FROM_EMAIL is not configured");
}

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailInput): Promise<void> => {
  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: "NexusHire",
          email: BREVO_FROM_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Brevo email failed (${response.status}): ${error}`);
  }
};