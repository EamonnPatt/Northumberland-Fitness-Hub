import { Router } from "express";
import { User, ROLE_OPTIONS } from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);

router.get("/users", async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ ok: true, users });
});

router.put("/users/:id/role", async (req, res) => {
  const { role } = req.body || {};
  if (!ROLE_OPTIONS.includes(role)) {
    return res.status(422).json({ ok: false, message: "Invalid role." });
  }
  if (req.params.id === req.user._id.toString() && role !== "admin") {
    return res.status(400).json({ ok: false, message: "You can't remove your own admin access." });
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ ok: false, message: "User not found." });
  }
  user.role = role;
  await user.save();
  res.json({ ok: true, user });
});

export default router;
