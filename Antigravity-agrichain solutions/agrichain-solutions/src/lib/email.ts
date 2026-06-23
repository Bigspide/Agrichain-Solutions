import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[EmailService] RESEND_API_KEY is not set. Email not sent.");
    return { success: false, error: "API Key missing" };
  }

  try {
    const data = await resend.emails.send({
      from: "AgriChain <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
    return { success: true, data };
  } catch (error) {
    console.error("[EmailService] Error sending email:", error);
    return { success: false, error };
  }
}
