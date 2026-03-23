import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController<T> = (req: T, res: Response, next: NextFunction) => Promise<any> | any;

export const asyncHandler = <T extends Request>(
  requestHandler: AsyncController<T>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(requestHandler(req as T, res, next)).catch(next);
  };
};
