export function successResponse(res, data, statusCode = 200, meta = {}) {
  const requestId = res.req?.id || meta.requestId || 'req-' + Date.now();
  return res.status(statusCode).json({
    success: true,
    data,
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}

export function errorResponse(res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = [], meta = {}) {
  const requestId = res.req?.id || meta.requestId || 'req-' + Date.now();
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      requestId,
      timestamp: new Date().toISOString(),
      ...meta,
    },
  });
}
