/**
 * Server-Side Input Validation Middleware - Practical 7
 * Validates request payload before reaching database controller
 */
export const validateTaskInput = (req, res, next) => {
  const { title, priority } = req.body;

  if (req.method === 'POST') {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "title" is required and cannot be empty.'
      });
    }

    if (title.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "title" must be at least 3 characters long.'
      });
    }
  }

  if (priority && !['low', 'medium', 'high'].includes(priority.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error: "priority" must be low, medium, or high.'
    });
  }

  next();
};
