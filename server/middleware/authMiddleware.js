const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'concert_jwt_secret_rizalswikey_anti_double_booking_2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // If guest / demo header present
    const guestId = req.headers['x-guest-id'];
    if (guestId) {
      req.user = {
        id: guestId,
        name: 'Guest Reviewer',
        email: 'guest@demo.local',
        role: 'CUSTOMER'
      };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}

// Optional auth: attaches user if token exists, but doesn't block if missing
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const guestId = req.headers['x-guest-id'];

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // ignore token parse error for optional
    }
  } else if (guestId) {
    req.user = { id: guestId, name: 'Guest Reviewer' };
  }

  next();
}

module.exports = { authMiddleware, optionalAuth };
