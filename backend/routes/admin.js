import express from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * Middleware to check if user is admin
 */
const requireAdmin = async (req, res, next) => {
  try {
    const result = await query(
      'SELECT user_type FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (result.rows[0].user_type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('[Admin] Authorization error:', error);
    res.status(500).json({ error: 'Authorization check failed' });
  }
};

/**
 * GET /api/admin/stats
 * Get platform statistics (admin only)
 */
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Total users by type
    const usersResult = await query(`
      SELECT
        COUNT(*) as total_users,
        COUNT(CASE WHEN user_type = 'pro' THEN 1 END) as pro_users,
        COUNT(CASE WHEN user_type = 'diy' THEN 1 END) as diy_users
      FROM users
    `);

    // Total inspections
    const inspectionsResult = await query('SELECT COUNT(*) FROM inspections');

    // Active subscriptions (pro users with active or trial status)
    const subscriptionsResult = await query(`
      SELECT COUNT(*) FROM users
      WHERE user_type = 'pro'
      AND subscription_status IN ('active', 'trial')
    `);

    // Estimate revenue (simplified calculation)
    // Pro Basic: $99, Pro Team: $299, DIY varies
    const revenueResult = await query(`
      SELECT
        COUNT(CASE WHEN plan = 'pro-basic' AND subscription_status IN ('active', 'trial') THEN 1 END) * 99 +
        COUNT(CASE WHEN plan = 'pro-team' AND subscription_status IN ('active', 'trial') THEN 1 END) * 299 +
        COUNT(CASE WHEN plan = 'diy-single' THEN 1 END) * 50 +
        COUNT(CASE WHEN plan = 'diy-5pack' THEN 1 END) * 200 +
        COUNT(CASE WHEN plan = 'diy-premium' THEN 1 END) * 150
        as estimated_revenue
      FROM users
    `);

    res.json({
      stats: {
        totalUsers: parseInt(usersResult.rows[0].total_users),
        proUsers: parseInt(usersResult.rows[0].pro_users),
        diyUsers: parseInt(usersResult.rows[0].diy_users),
        totalInspections: parseInt(inspectionsResult.rows[0].count),
        activeSubscriptions: parseInt(subscriptionsResult.rows[0].count),
        totalRevenue: parseInt(revenueResult.rows[0].estimated_revenue || 0),
      },
    });
  } catch (error) {
    console.error('[Admin] Stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics' });
  }
});

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type = 'all' } = req.query;

    let queryText = `
      SELECT id, email, user_type, company_name, phone, plan,
             inspection_credits, subscription_status, created_at
      FROM users
    `;

    const params = [];

    if (type === 'pro') {
      queryText += ` WHERE user_type = $1`;
      params.push('pro');
    } else if (type === 'diy') {
      queryText += ` WHERE user_type = $1`;
      params.push('diy');
    }

    queryText += ` ORDER BY created_at DESC`;

    const result = await query(queryText, params);

    res.json({
      users: result.rows,
    });
  } catch (error) {
    console.error('[Admin] Get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

/**
 * GET /api/admin/users/:id
 * Get specific user details (admin only)
 */
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, email, user_type, company_name, phone, plan,
              inspection_credits, subscription_status, subscription_expires_at,
              created_at
       FROM users WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error('[Admin] Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

/**
 * PATCH /api/admin/users/:id
 * Update user details (admin only)
 */
router.patch('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { inspectionCredits, subscriptionStatus, plan } = req.body;

    const updates = [];
    const params = [id];
    let paramCount = 2;

    if (inspectionCredits !== undefined) {
      updates.push(`inspection_credits = $${paramCount}`);
      params.push(inspectionCredits);
      paramCount++;
    }

    if (subscriptionStatus) {
      updates.push(`subscription_status = $${paramCount}`);
      params.push(subscriptionStatus);
      paramCount++;
    }

    if (plan) {
      updates.push(`plan = $${paramCount}`);
      params.push(plan);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const queryText = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, email, user_type, company_name, plan, inspection_credits, subscription_status
    `;

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('[Admin] Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Delete user (admin only)
 */
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await query('SELECT email FROM users WHERE id = $1', [id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete user's inspections first (cascade)
    await query('DELETE FROM inspections WHERE user_id = $1', [id]);

    // Delete user
    await query('DELETE FROM users WHERE id = $1', [id]);

    console.log(`[Admin] Deleted user: ${userResult.rows[0].email}`);

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('[Admin] Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/admin/inspections
 * Get all inspections across platform (admin only)
 */
router.get('/inspections', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await query(
      `SELECT i.*, u.email, u.company_name
       FROM inspections i
       JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      inspections: result.rows,
    });
  } catch (error) {
    console.error('[Admin] Get inspections error:', error);
    res.status(500).json({ error: 'Failed to retrieve inspections' });
  }
});

export default router;
