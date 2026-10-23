import { AppError } from '../utils/errors.js';
import { errorResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  const reqId = req.id || 'req-' + Date.now();

  // If already sent, delegate to default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle JSON parse errors from express.json()
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return errorResponse(res, 'Malformed JSON payload in request body', 400, 'INVALID_JSON', [], { requestId: reqId });
  }

  // Handle Multer upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, `Uploaded file exceeds maximum permitted size of ${env.MAX_UPLOAD_SIZE_MB}MB`, 400, 'FILE_TOO_LARGE', [], { requestId: reqId });
  }

  // Handle known AppErrors
  if (err instanceof AppError) {
    return errorResponse(res, err.message, err.statusCode, err.code, err.details, { requestId: reqId });
  }

  // Handle unexpected internal errors
  const isDev = env.NODE_ENV !== 'production';
  const message = isDev ? (err.message || 'Internal Server Error') : 'An unexpected internal error occurred';
  const details = isDev && err.stack ? [err.stack.split('\n')[0]] : [];

  console.error(`[UnhandledError][${reqId}]`, err);

  return errorResponse(res, message, 500, 'INTERNAL_SERVER_ERROR', details, { requestId: reqId });
}
