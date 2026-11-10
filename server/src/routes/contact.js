import { Router } from "express";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";

// Handles both the "Contact" and "Join The Club" forms on the site (replaces
// the old cPanel contact.php). Sends through Resend's web API when RESEND_API_KEY
// and MAIL_FROM are set (GoDaddy Node hosting blocks SMTP); otherwise falls back
// to SMTP, e.g. SMTP_HOST=mail.northumberlandfitness.com, port 465.

const router = Router();

const DESTINATION_EMAIL = process.env.CONTACT_TO || "contact@northumberlandfitness.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let transporter;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, message: "Too many messages. Please try again in a few minutes." },
});

// Strips CR/LF so form input can't be used to inject extra mail headers.
function clean(value) {
  return typeof value === "string" ? value.replace(/[\r\n]/g, "").trim() : "";
}

router.post("/", contactLimiter, async (req, res) => {
  const data = req.body;
  if (!data || typeof data !== "object") {
    return res.status(400).json({ ok: false, message: "Invalid request." });
  }

  function required(key) {
    const value = clean(data[key]);
    if (!value) {
      res.status(422).json({ ok: false, message: `Missing required field: ${key}` });
      return null;
    }
    return value;
  }

  let subject;
  let text;
  let email;
  let senderName;

  if (data.type === "register") {
    const firstName = required("firstName");
    if (firstName === null) return;
    const lastName = required("lastName");
    if (lastName === null) return;
    email = required("email");
    if (email === null) return;
    const phone = clean(data.phone);
    const membership = clean(data.membership);

    senderName = `${firstName} ${lastName}`;
    subject = "New membership signup — Northumberland Fitness";
    text = `First name: ${firstName}\nLast name: ${lastName}\nEmail: ${email}\nPhone: ${phone}\nMembership: ${membership}\n`;
  } else {
    const name = required("name");
    if (name === null) return;
    email = required("email");
    if (email === null) return;
    const message = typeof data.message === "string" ? data.message.trim() : "";
    if (!message) {
      return res.status(422).json({ ok: false, message: "Missing required field: message" });
    }

    senderName = name;
    subject = "New contact form message — Northumberland Fitness";
    text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`;
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(422).json({ ok: false, message: "Please enter a valid email address." });
  }

  const { RESEND_API_KEY, MAIL_FROM } = process.env;
  const useResend = Boolean(RESEND_API_KEY && MAIL_FROM);
  if (!useResend && !process.env.SMTP_HOST) {
    console.error("Contact form submitted but neither RESEND_API_KEY/MAIL_FROM nor SMTP_HOST is configured.");
    return res.status(500).json({ ok: false, message: "Could not send your message. Please try again later." });
  }

  try {
    if (useResend) {
      // Shows the visitor's name as the sender, with their email as Reply-To.
      // The address itself must stay on the domain verified in Resend, so the
      // visitor's own address can't be used as the From.
      const sendingAddress = MAIL_FROM.match(/<([^>]+)>/)?.[1] || MAIL_FROM;
      const displayName = senderName.replace(/["<>]/g, "").slice(0, 80);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: displayName ? `${displayName} <${sendingAddress}>` : MAIL_FROM,
          to: [DESTINATION_EMAIL],
          reply_to: email,
          subject,
          text,
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) {
        throw new Error(`Resend responded ${response.status}: ${await response.text().catch(() => "")}`);
      }
    } else {
      await getTransporter().sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to: DESTINATION_EMAIL,
        replyTo: email,
        subject,
        text,
      });
    }
  } catch (err) {
    console.error("Failed to send contact email:", err);
    return res.status(500).json({ ok: false, message: "Could not send your message. Please try again later." });
  }

  res.json({ ok: true, message: "Thanks! We'll be in touch soon." });
});

export default router;
