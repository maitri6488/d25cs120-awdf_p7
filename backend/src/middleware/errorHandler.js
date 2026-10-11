export const globalErrorHandler = (err, req, res, next) => {
  console.error('[Error Pipeline]', err);

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    return res.status(400).json({
      success: false,
      error: 'Validation Failed',
      messages
    });
  }

  // Mongoose Duplicate Key Error (e.g., email already exists)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      error: 'A user with this email address already exists.'
    });
  }

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: `Resource not found with id of ${err.value}`
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
