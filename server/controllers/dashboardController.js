const { db } = require('../db');

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await db.getDashboardStats(userId);
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics',
      error: error.message
    });
  }
};

exports.getHealth = async (req, res) => {
  try {
    const status = db.getStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error.message
    });
  }
};
