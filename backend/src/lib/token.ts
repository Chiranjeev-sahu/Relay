import jwt from "jsonwebtoken";
import { env } from "./env.js";

export type payload = { sub: string };

const generateToken = (userId: string): string => {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: "7d" });
};

const verifyToken = (token: string): payload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as payload;
    return decoded;
  } catch {
    return null;
  }
};

export { generateToken, verifyToken };
