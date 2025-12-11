import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/signup
 * Create a new user account
 */
router.post('/signup', async (req, res) => {
  try {
    const { email, password, plan = 'basic' } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      `INSERT INTO users (email, password_hash, plan, created_at, subscription_expires_at)
       VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '30 days')
       RETURNING id, email, plan, created_at`,
      [email.toLowerCase(), passwordHash, plan]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.plan);

    console.log(`[Auth] New user registered: ${user.email}`);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan
      },
      token
    });
  } catch (error) {
    console.error('[Auth] Signup error:', error);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, plan, subscription_expires_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check subscription status
    const isSubscriptionActive = new Date(user.subscription_expires_at) > new Date();

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.plan);

    console.log(`[Auth] User logged in: ${user.email}`);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        subscriptionActive: isSubscriptionActive,
        subscriptionExpiresAt: user.subscription_expires_at
      },
      token
    });
  } catch (error) {
    console.error('[Auth] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * GET /api/auth/me
 * Get current user info (requires authentication)
 */
router.get('/me', async (req, res) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Import here to avoid circular dependency
    const { authenticateToken } = await import('../middleware/auth.js');

    // Use middleware function manually
    authenticateToken(req, res, async () => {
      const result = await query(
        'SELECT id, email, plan, created_at, subscription_expires_at FROM users WHERE id = $1',
        [req.user.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = result.rows[0];
      const isSubscriptionActive = new Date(user.subscription_expires_at) > new Date();

      res.json({
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
          subscriptionActive: isSubscriptionActive,
          subscriptionExpiresAt: user.subscription_expires_at,
          createdAt: user.created_at
        }
      });
    });
  } catch (error) {
    console.error('[Auth] Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

export default router;
