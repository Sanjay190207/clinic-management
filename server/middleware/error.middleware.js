/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.name = err.name;
  error.code = err.code;

  // Log error with timestamp for backend diagnostics
  console.error(`[${new Date().toISOString()}] Error ${req.method} ${req.originalUrl}:`, err.message || err);

  // Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with identifier of ${err.value}`;
    return res.status(404).json({
      success: false,
      message,
    });
  }

  // Mongoose duplicate key error (code 11000) - e.g., email or simultaneous booking conflict
  if (err.code === 11000) {
    let field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    let message = `Duplicate value entered for ${field}.`;

    // Special handling for appointment race condition / duplicate booking
    if (err.keyPattern && err.keyPattern.doctorId && err.keyPattern.appointmentDate && err.keyPattern.startTime) {
      message = 'This appointment slot has already been booked by another patient. Please choose a different time slot.';
      return res.status(409).json({
        success: false,
        message,
        conflict: 'SLOT_ALREADY_BOOKED',
      });
    }

    if (field === 'email') {
      message = 'An account with this email address already exists.';
    }

    return res.status(409).json({
      success: false,
      message,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    return res.status(400).json({
      success: false,
      message,
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {}),
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token.',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please log in again.',
    });
  }

  const statusCode = error.statusCode || res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;

