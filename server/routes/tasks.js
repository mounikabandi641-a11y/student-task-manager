const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// Public health check
router.get('/health', dashboardController.getHealth);

// All task routes and dashboard are protected by JWT authentication
router.get('/tasks', authenticateToken, taskController.getTasks);
router.get('/tasks/:id', authenticateToken, taskController.getTaskById);
router.post('/tasks', authenticateToken, taskController.createTask);
router.put('/tasks/:id', authenticateToken, taskController.updateTask);
router.delete('/tasks/:id', authenticateToken, taskController.deleteTask);
router.get('/dashboard', authenticateToken, dashboardController.getDashboardStats);

module.exports = router;
