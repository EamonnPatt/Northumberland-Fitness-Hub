import { Router } from "express";
import { listUsers, findUserById, setUserRole, ROLE_OPTIONS } from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import provisionalRoutes from "./provisional.js";

const router = Router();

router.use(requireAuth, requireAdmin);
router.use("/provisional", provisionalRoutes);

router.get("/users", async (_req, res) => {
  const users = await listUsers();
  res.json({ ok: true, users });
});

router.put("/users/:id/role", async (req, res) => {
  const { role } = req.body || {};
  if (!ROLE_OPTIONS.includes(role)) {
    return res.status(422).json({ ok: false, message: "Invalid role." });
  }
  if (req.params.id === req.user._id && role !== "admin") {
    return res.status(400).json({ ok: false, message: "You can't remove your own admin access." });
  }

  if (!(await findUserById(req.params.id))) {
    return res.status(404).json({ ok: false, message: "User not found." });
  }
  const user = await setUserRole(req.params.id, role);
  res.json({ ok: true, user });
});

export default router;
