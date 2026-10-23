export function requestLogger(req, res, next) {
  const start = Date.now();
  const reqId = req.id || 'req-' + Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const sanitizedUrl = req.originalUrl.replace(/([?&](token|secret|password|key)=)[^&]+/gi, '$1[REDACTED]');
    const logEntry = {
      level: res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO',
      timestamp: new Date().toISOString(),
      requestId: reqId,
      method: req.method,
      url: sanitizedUrl,
      status: res.statusCode,
      durationMs: duration,
      userRole: req.user?.role || 'anonymous',
      ip: req.ip || req.socket.remoteAddress,
    };

    console.log(JSON.stringify(logEntry));
  });

  next();
}
