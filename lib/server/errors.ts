/** Framework-neutral domain error. Route adapters map this to HTTP responses. */
export class AppError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.status = status;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
