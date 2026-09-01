import bcrypt from "bcryptjs";
import { User } from "../models/User.js";

// Guarantees ADMIN_EMAIL (if set) is an admin account. Creates it on first
// run; on later runs only promotes the role if needed and never touches an
// existing password. Additional admins can be promoted later from the
// admin panel itself.
export async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`Promoted existing account ${email} to admin.`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({
    firstName: "Admin",
    lastName: "Account",
    email,
    passwordHash,
    sex: "prefer_not_to_say",
    role: "admin",
  });
  console.log(`Created admin account for ${email}.`);
}
