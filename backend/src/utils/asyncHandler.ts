import { NextFunction, Request, RequestHandler, Response } from "express";

export const asyncHandler = <T extends Request>(
  requestHandler: (req: T, res: Response, next: NextFunction) => any
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req as T, res, next)).catch(next);
  };
};
