import { validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    return res.status(400).json({
      success: false,
      error: {
        message: errorArray[0].msg || 'Error de validación',
        details: errorArray,
      },
    });
  }
  next();
};

/**
 * Middleware to log incoming requests
 */
export const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

/**
 * Pagination middleware
 */
export const paginationMiddleware = (req, res, next) => {
  const page = Math.max(1, parseInt(req.query.page || '1'));
  const limit = Math.min(100, parseInt(req.query.limit || '20'));
  const offset = (page - 1) * limit;

  req.pagination = {
    page,
    limit,
    offset,
  };

  next();
};
