import { Router } from "express";
import { getOrCreateSiteContent } from "../models/SiteContent.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const content = await getOrCreateSiteContent();
  res.json({ ok: true, content });
});

router.put("/", requireAuth, requireAdmin, async (req, res) => {
  const { hero, hours, classes, pricing } = req.body || {};
  const content = await getOrCreateSiteContent();

  if (hero !== undefined) content.hero = hero;
  if (hours !== undefined) content.hours = hours;
  if (classes !== undefined) content.classes = classes;
  if (pricing !== undefined) content.pricing = pricing;

  await content.save();
  res.json({ ok: true, content });
});

export default router;
