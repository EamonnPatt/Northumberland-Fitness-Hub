import { Router } from "express";
import {
  createProvisionalMembership,
  listProvisionalMemberships,
  deleteProvisionalMembership,
} from "../models/ProvisionalMembership.js";

// Mounted under /api/admin, which already requires an admin.
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const memberships = await listProvisionalMemberships({ query: req.query.q, status: req.query.status });
    res.json({ ok: true, memberships });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const membership = await createProvisionalMembership(req.body || {}, req.user.email);
    res.status(201).json({ ok: true, membership });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    if (!(await deleteProvisionalMembership(req.params.id))) {
      return res.status(404).json({ ok: false, message: "Membership not found." });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
