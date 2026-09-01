import jwt from "jsonwebtoken";

const EXPIRES_IN = "7d";

export function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required but was not provided.");
  }
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required but was not provided.");
  }
  return jwt.verify(token, secret);
}
