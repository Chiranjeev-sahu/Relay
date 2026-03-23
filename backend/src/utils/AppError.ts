export class AppError extends Error {
  public isOperational: boolean;

  constructor(
    public statusCode: number,
    public message: string,
    public errors: unknown[] = []
  ) {
    super(message);
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
