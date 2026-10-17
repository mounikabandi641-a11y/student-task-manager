const { db } = require('../db');

// Allowed enum values
const VALID_PRIORITIES = ['High', 'Medium', 'Low'];
const VALID_STATUSES = ['Pending', 'In Progress', 'Completed'];

exports.getTasks = async (req, res) => {
  try {
    const { status, subject, priority, deadline, search } = req.query;
    const userId = req.user.id;

    const tasks = await db.getAllTasks({
      userId,
      status,
      subject,
      priority,
      deadline,
      search
    });

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve tasks',
      error: error.message
    });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await db.getTaskById(id, userId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found or you do not have permission to view it.`
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Error fetching task by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve task',
      error: error.message
    });
  }
};

exports.createTask = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, subject, priority, due_date, status } = req.body;

    // Validation
    const errors = [];
    if (!title || !title.trim()) {
      errors.push('Title is required.');
    }
    if (!subject || !subject.trim()) {
      errors.push('Subject is required.');
    }
    if (!priority || !VALID_PRIORITIES.includes(priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
    }
    if (!due_date || isNaN(Date.parse(due_date))) {
      errors.push('A valid due date is required (YYYY-MM-DD).');
    }
    if (status && !VALID_STATUSES.includes(status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const newTask = await db.createTask({
      userId,
      title: title.trim(),
      description: (description || '').trim(),
      subject: subject.trim(),
      priority,
      due_date: due_date.split('T')[0],
      status: status || 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task',
      error: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, subject, priority, due_date, status } = req.body;

    const existingTask = await db.getTaskById(id, userId);
    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found or you do not have permission to modify it.`
      });
    }

    // Validation if values provided
    const errors = [];
    if (title !== undefined && (!title || !title.trim())) {
      errors.push('Title cannot be empty.');
    }
    if (subject !== undefined && (!subject || !subject.trim())) {
      errors.push('Subject cannot be empty.');
    }
    if (priority !== undefined && !VALID_PRIORITIES.includes(priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}.`);
    }
    if (due_date !== undefined && isNaN(Date.parse(due_date))) {
      errors.push('A valid due date is required (YYYY-MM-DD).');
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}.`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const updatedTask = await db.updateTask(id, userId, {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() }),
      ...(subject !== undefined && { subject: subject.trim() }),
      ...(priority !== undefined && { priority }),
      ...(due_date !== undefined && { due_date: due_date.split('T')[0] }),
      ...(status !== undefined && { status })
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task',
      error: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await db.deleteTask(id, userId);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${id} not found or you do not have permission to delete it.`
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully',
      id
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task',
      error: error.message
    });
  }
};
