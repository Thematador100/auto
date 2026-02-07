import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

/**
 * Middleware to verify JWT tokens and attach user info to request
 * Usage: Add this middleware to any route that requires authentication
 */
export const authenticateToken = (req, res, next) => {
  // Get token from Authorization header (Bearer token)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      plan: decoded.plan,
            userType: decoded.userType
    };

    console.log(`[Auth] User ${req.user.email} authenticated`);
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

/**
 * Optional middleware to check if user has a specific subscription plan
 */
export const requirePlan = (requiredPlan) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (req.user.plan !== requiredPlan) {
      return res.status(403).json({
        error: `This feature requires ${requiredPlan} plan`,
        currentPlan: req.user.plan
      });
    }

    next();
  };
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (userId, email, plan, userType) => {
  return jwt.sign(
    { userId, email, plan, userType },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export default { authenticateToken, requirePlan, generateToken };
