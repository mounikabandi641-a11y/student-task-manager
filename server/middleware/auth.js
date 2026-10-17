const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'student_task_manager_fallback_secret_key_2026';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }

    // Attach verified user exclusively from token payload
    req.user = {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email
    };
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: err.name === 'TokenExpiredError' 
        ? 'Session expired. Please log in again.' 
        : 'Invalid or malformed token.',
      error: err.message
    });
  }
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};
