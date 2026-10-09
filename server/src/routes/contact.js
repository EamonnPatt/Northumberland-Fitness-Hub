import { Router } from "express";
import rateLimit from "express-rate-limit";
import nodemailer from "nodemailer";

// Handles both the "Contact" and "Join The Club" forms on the site (replaces
// the old cPanel contact.php). Sends mail over SMTP — any mailbox works, e.g.
// the cPanel email account: SMTP_HOST=mail.northumberlandfitness.com, port 465.

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

  if (data.type === "register") {
    const firstName = required("firstName");
    if (firstName === null) return;
    const lastName = required("lastName");
    if (lastName === null) return;
    email = required("email");
    if (email === null) return;
    const phone = clean(data.phone);
    const membership = clean(data.membership);

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

    subject = "New contact form message — Northumberland Fitness";
    text = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n`;
  }

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(422).json({ ok: false, message: "Please enter a valid email address." });
  }

  if (!process.env.SMTP_HOST) {
    console.error("Contact form submitted but SMTP_HOST is not configured.");
    return res.status(500).json({ ok: false, message: "Could not send your message. Please try again later." });
  }

  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || process.env.SMTP_USER,
      to: DESTINATION_EMAIL,
      replyTo: email,
      subject,
      text,
    });
  } catch (err) {
    console.error("Failed to send contact email:", err);
    return res.status(500).json({ ok: false, message: "Could not send your message. Please try again later." });
  }

  res.json({ ok: true, message: "Thanks! We'll be in touch soon." });
});

export default router;
