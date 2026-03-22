import { Response } from "express";
import { env } from "./env.js";
const options = {
  sameSite: "lax" as const,
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("accessToken", token, options);
};

const clearAuthCookie = (res: Response): void => {
  res.clearCookie("accessToken", options);
};

export { setAuthCookie, clearAuthCookie };
