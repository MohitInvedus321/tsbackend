import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * Wraps an async route handler and forwards any thrown errors to next().
 * Without this, unhandled promise rejections bypass Express error handlers.
 *
 * @example
 * router.get('/users/:id', asyncHandler(async (req, res) => {
 *   const user = await UserService.findById(req.params.id); // throws NotFoundError
 *   res.json(user);
 * }));
 */
export function asyncHandler(fn: AsyncRequestHandler): RequestHandler {
  return function wrappedAsync(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
