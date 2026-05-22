/**
 * Send success response
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send error response
 */
export const sendError = (res, message = 'Error', statusCode = 500, details = null) => {
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(details && { details }),
    },
  });
};

/**
 * Send paginated response
 */
export const sendPaginated = (res, data, pagination, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: data.length,
      hasMore: data.length === pagination.limit,
    },
  });
};
