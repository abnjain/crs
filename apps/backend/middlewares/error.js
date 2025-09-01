export function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
  next(err);
  // Optionally log the error to an external service
}