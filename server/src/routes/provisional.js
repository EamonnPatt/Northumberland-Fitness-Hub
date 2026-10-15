import { Router } from "express";
import {
  createProvisionalMembership,
  listProvisionalMemberships,
  findProvisionalMembership,
  setConfirmationStatus,
  deleteProvisionalMembership,
} from "../models/ProvisionalMembership.js";
import { sendPassConfirmation } from "../utils/notify.js";

// Mounted under /api/admin, which already requires an admin.
const router = Router();

// Emails the pass details and records whether that worked on the pass itself.
async function confirm(membership) {
  const notification = await sendPassConfirmation(membership);
  await setConfirmationStatus(membership._id, notification.status);
  return { membership: { ...membership, confirmation: notification.status }, notification };
}

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
    const created = await createProvisionalMembership(req.body || {}, req.user.email);
    const { membership, notification } = await confirm(created);
    res.status(201).json({ ok: true, membership, notification });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/resend", async (req, res, next) => {
  try {
    const existing = await findProvisionalMembership(req.params.id);
    if (!existing) return res.status(404).json({ ok: false, message: "Membership not found." });
    const { membership, notification } = await confirm(existing);
    res.json({ ok: true, membership, notification });
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
