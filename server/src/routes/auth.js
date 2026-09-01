import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { User, SEX_OPTIONS, AGE_RANGE_OPTIONS, MEMBERSHIP_OPTIONS } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, async (req, res) => {
  const { firstName, lastName, email, password, phone, membership, sex, ageRange } = req.body || {};

  if (!firstName || !lastName || !email || !password || !sex) {
    return res.status(422).json({ ok: false, message: "First name, last name, email, password, and sex are required." });
  }
  if (typeof password !== "string" || password.length < 8) {
    return res.status(422).json({ ok: false, message: "Password must be at least 8 characters." });
  }
  if (!SEX_OPTIONS.includes(sex)) {
    return res.status(422).json({ ok: false, message: "Invalid sex value." });
  }
  if (ageRange && !AGE_RANGE_OPTIONS.includes(ageRange)) {
    return res.status(422).json({ ok: false, message: "Invalid age range value." });
  }
  if (membership && !MEMBERSHIP_OPTIONS.includes(membership)) {
    return res.status(422).json({ ok: false, message: "Invalid membership value." });
  }

  const normalizedEmail = String(email).toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(409).json({ ok: false, message: "An account with that email already exists." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    email: normalizedEmail,
    passwordHash,
    phone: phone || "",
    membership: membership || "basic",
    sex,
    ageRange: ageRange || null,
  });

  const token = signToken(user);
  res.status(201).json({ ok: true, token, user });
});

router.post("/login", authLimiter, async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(422).json({ ok: false, message: "Email and password are required." });
  }

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) {
    return res.status(401).json({ ok: false, message: "Incorrect email or password." });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ ok: false, message: "Incorrect email or password." });
  }

  const token = signToken(user);
  res.json({ ok: true, token, user });
});

router.get("/me", requireAuth, async (req, res) => {
  res.json({ ok: true, user: req.user });
});

export default router;
