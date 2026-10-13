import { Router } from "express";
import { getOrCreateSiteContent, saveSiteContent } from "../models/SiteContent.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res) => {
  const content = await getOrCreateSiteContent();
  res.json({ ok: true, content });
});

router.put("/", requireAuth, requireAdmin, async (req, res, next) => {
  const { hero, hours, classes, pricing } = req.body || {};
  try {
    await saveSiteContent({ hero, hours, classes, pricing });
    const content = await getOrCreateSiteContent();
    res.json({ ok: true, content });
  } catch (err) {
    next(err);
  }
});

export default router;
