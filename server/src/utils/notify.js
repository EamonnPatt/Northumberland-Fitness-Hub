import { renderPassEmail } from "./passEmail.js";

// Emails customers their pass details through Resend's web API. GoDaddy's Node
// hosting only allows outbound web traffic (no SMTP), so this is plain HTTPS.
// Needs RESEND_API_KEY and MAIL_FROM (an address on a domain verified in Resend,
// e.g. "Northumberland Fitness <passes@northumberlandfitness.com>").

// Resolves to { status, message }: "sent", "failed", or "skipped" when there is
// nothing to send to or sending isn't configured. Never throws, so a mail
// problem can't lose a pass that has already been saved.
export async function sendPassConfirmation(membership) {
  if (!membership.email) {
    return { status: "skipped", message: "No email on file, so nothing was sent. Give the customer their code in person." };
  }
  const { RESEND_API_KEY, MAIL_FROM } = process.env;
  if (!RESEND_API_KEY || !MAIL_FROM) {
    console.error("Provisional pass saved but RESEND_API_KEY / MAIL_FROM are not configured.");
    return { status: "skipped", message: "Email sending isn't set up yet, so no confirmation was sent." };
  }
  const { subject, text, html } = renderPassEmail(membership);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, to: [membership.email], subject, text, html }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error("Resend rejected the confirmation email:", res.status, await res.text().catch(() => ""));
      return { status: "failed", message: "The confirmation email couldn't be sent. Check the address and try Resend." };
    }
    return { status: "sent", message: `Confirmation emailed to ${membership.email}.` };
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
    return { status: "failed", message: "The confirmation email couldn't be sent. Try Resend in a moment." };
  }
}
