import Task from '../models/Task.js';

/**
 * Get all tasks for the logged in user
 * GET /api/tasks
 */
export const getAllTasks = async (req, res, next) => {
  try {
    const { completed, priority, search } = req.query;
    const filter = { user: req.user._id };

    if (completed !== undefined && completed !== '') {
      filter.completed = completed === 'true';
    }

    if (priority) {
      filter.priority = priority.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single task by ID
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.taskId, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.taskId} not found or unauthorized.`
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new task (Protected)
 * POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, completed, priority } = req.body;

    const newTask = await Task.create({
      user: req.user._id,
      title,
      description: description || '',
      completed: Boolean(completed),
      priority: priority ? priority.toLowerCase() : 'medium'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully in MongoDB.',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Update an existing task
 * PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    if (updates.priority) updates.priority = updates.priority.toLowerCase();

    const updatedTask = await Task.findOneAndUpdate(
      { _id: req.taskId, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.taskId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a task
 * DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const deletedTask = await Task.findOneAndDelete({ _id: req.taskId, user: req.user._id });

    if (!deletedTask) {
      return res.status(404).json({
        success: false,
        error: `Task with ID ${req.taskId} not found.`
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      data: deletedTask
    });
  } catch (err) {
    next(err);
  }
};
