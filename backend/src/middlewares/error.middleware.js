export function notFoundHandler(req, res) {
  res.status(404).json({
    ok: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  res.status(status).json({
    ok: false,
    error: err.message || "Internal server error"
  });
}
