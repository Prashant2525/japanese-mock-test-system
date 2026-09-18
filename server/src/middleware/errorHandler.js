export function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, req, res, next) {
  console.error(error);
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  res.status(status).json({
    message: status === 500 ? 'Something went wrong on the server.' : error.message,
    ...(process.env.NODE_ENV !== 'production' && status === 500 ? { detail: error.message } : {})
  });
}

