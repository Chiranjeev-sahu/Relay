import { NextFunction, Request, Response } from "express";
import * as core from "express-serve-static-core";
import { ParsedQs } from "qs";
import { verifyToken } from "./token.js";

interface AuthRequest<
  P = core.ParamsDictionary,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = ParsedQs,
> extends Request<P, ResBody, ReqBody, ReqQuery> {
  userId?: string;
}
const verify = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  req.userId = decoded.sub;
  next();
};

export { verify, type AuthRequest };
