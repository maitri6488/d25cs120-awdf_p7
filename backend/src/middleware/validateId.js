import mongoose from 'mongoose';

export const validateTaskId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      error: `Invalid task ID format: "${id}". Must be a valid 24-character hexadecimal ObjectId.`
    });
  }
  req.taskId = id;
  next();
};
