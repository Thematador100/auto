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
 * Get all users (admin only) - Enhanced with license fields
 */
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type = 'all', licenseStatus } = req.query;

    let queryText = `
      SELECT id, email, user_type, company_name, phone, plan,
             inspection_credits, subscription_status, created_at,
             license_status, license_type, territory, revenue_share_percentage,
             features_enabled, license_issued_at, license_expires_at,
             monthly_platform_fee, upfront_fee_paid, onboarding_completed,
             stripe_account_id
      FROM users
    `;

    const params = [];
    const conditions = [];

    if (type === 'pro') {
      conditions.push(`user_type = $${params.length + 1}`);
      params.push('pro');
    } else if (type === 'diy') {
      conditions.push(`user_type = $${params.length + 1}`);
      params.push('diy');
    }

    if (licenseStatus) {
      conditions.push(`license_status = $${params.length + 1}`);
      params.push(licenseStatus);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ` + conditions.join(' AND ');
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
 * Update user details (admin only) - Enhanced with license fields
 */
router.patch('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      inspectionCredits,
      subscriptionStatus,
      plan,
      licenseStatus,
      licenseType,
      territory,
      revenueSharePercentage,
      monthlyPlatformFee,
      upfrontFeePaid,
      featuresEnabled,
      stripeAccountId
    } = req.body;

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

    if (licenseStatus) {
      updates.push(`license_status = $${paramCount}`);
      params.push(licenseStatus);
      paramCount++;
    }

    if (licenseType) {
      updates.push(`license_type = $${paramCount}`);
      params.push(licenseType);
      paramCount++;
    }

    if (territory !== undefined) {
      updates.push(`territory = $${paramCount}`);
      params.push(territory);
      paramCount++;
    }

    if (revenueSharePercentage !== undefined) {
      updates.push(`revenue_share_percentage = $${paramCount}`);
      params.push(revenueSharePercentage);
      paramCount++;
    }

    if (monthlyPlatformFee !== undefined) {
      updates.push(`monthly_platform_fee = $${paramCount}`);
      params.push(monthlyPlatformFee);
      paramCount++;
    }

    if (upfrontFeePaid !== undefined) {
      updates.push(`upfront_fee_paid = $${paramCount}`);
      params.push(upfrontFeePaid);
      paramCount++;
    }

    if (featuresEnabled) {
      updates.push(`features_enabled = $${paramCount}`);
      params.push(JSON.stringify(featuresEnabled));
      paramCount++;
    }

    if (stripeAccountId !== undefined) {
      updates.push(`stripe_account_id = $${paramCount}`);
      params.push(stripeAccountId);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    const queryText = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $1
      RETURNING id, email, user_type, company_name, plan, inspection_credits, subscription_status,
                license_status, license_type, territory, revenue_share_percentage, features_enabled
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

/**
 * LICENSE MANAGEMENT ENDPOINTS
 */

/**
 * POST /api/admin/licenses/issue
 * Issue a new license to a user (admin only)
 */
router.post('/licenses/issue', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      userId,
      licenseType = 'independent',
      territory,
      revenueSharePercentage = 20,
      monthlyPlatformFee = 297,
      upfrontFeePaid = 0,
      featuresEnabled = {
        ev_module: false,
        advanced_fraud: true,
        ai_reports: true,
        lead_bot: false
      }
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Update user with license details
    const result = await query(
      `UPDATE users
       SET license_status = 'active',
           license_type = $2,
           territory = $3,
           revenue_share_percentage = $4,
           monthly_platform_fee = $5,
           upfront_fee_paid = $6,
           features_enabled = $7,
           license_issued_at = NOW(),
           license_expires_at = NULL
       WHERE id = $1
       RETURNING id, email, company_name, license_status, territory`,
      [userId, licenseType, territory, revenueSharePercentage, monthlyPlatformFee, upfrontFeePaid, JSON.stringify(featuresEnabled)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[Admin] License issued to user: ${result.rows[0].email}`);

    res.json({
      message: 'License issued successfully',
      license: result.rows[0]
    });
  } catch (error) {
    console.error('[Admin] Issue license error:', error);
    res.status(500).json({ error: 'Failed to issue license' });
  }
});

/**
 * PATCH /api/admin/licenses/:userId/status
 * Update license status (activate, suspend, cancel)
 */
router.patch('/licenses/:userId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!['active', 'suspended', 'cancelled', 'trial'].includes(status)) {
      return res.status(400).json({ error: 'Invalid license status' });
    }

    const result = await query(
      `UPDATE users
       SET license_status = $2
       WHERE id = $1
       RETURNING id, email, license_status`,
      [userId, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log(`[Admin] License ${status} for user: ${result.rows[0].email}`);

    res.json({
      message: `License ${status} successfully`,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('[Admin] Update license status error:', error);
    res.status(500).json({ error: 'Failed to update license status' });
  }
});

/**
 * PATCH /api/admin/licenses/:userId/features
 * Update feature flags for a license
 */
router.patch('/licenses/:userId/features', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { features } = req.body;

    if (!features || typeof features !== 'object') {
      return res.status(400).json({ error: 'Features object is required' });
    }

    const result = await query(
      `UPDATE users
       SET features_enabled = $2
       WHERE id = $1
       RETURNING id, email, features_enabled`,
      [userId, JSON.stringify(features)]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Features updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('[Admin] Update features error:', error);
    res.status(500).json({ error: 'Failed to update features' });
  }
});

/**
 * SALES TRACKING ENDPOINTS
 */

/**
 * POST /api/admin/sales
 * Record a sale for revenue share tracking
 */
router.post('/sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      userId,
      inspectionId,
      saleAmount,
      paymentMethod = 'stripe_independent',
      customerName,
      customerEmail,
      notes
    } = req.body;

    if (!userId || !saleAmount) {
      return res.status(400).json({ error: 'User ID and sale amount are required' });
    }

    // Get user's revenue share percentage
    const userResult = await query(
      'SELECT revenue_share_percentage FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const revenueSharePercentage = userResult.rows[0].revenue_share_percentage || 20;
    const revenueShareAmount = Math.floor((saleAmount * revenueSharePercentage) / 100);
    const inspectorRevenue = saleAmount - revenueShareAmount;

    // Record sale
    const result = await query(
      `INSERT INTO inspector_sales (
        user_id, inspection_id, sale_amount, revenue_share_amount,
        inspector_revenue, payment_method, customer_name, customer_email, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [userId, inspectionId, saleAmount, revenueShareAmount, inspectorRevenue,
       paymentMethod, customerName, customerEmail, notes]
    );

    console.log(`[Admin] Sale recorded: $${(saleAmount / 100).toFixed(2)} for user ID ${userId}`);

    res.json({
      message: 'Sale recorded successfully',
      sale: result.rows[0]
    });
  } catch (error) {
    console.error('[Admin] Record sale error:', error);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

/**
 * GET /api/admin/sales
 * Get all sales with revenue share tracking
 */
router.get('/sales', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, revenueShareStatus, limit = 50, offset = 0 } = req.query;

    let queryText = `
      SELECT s.*, u.email, u.company_name
      FROM inspector_sales s
      JOIN users u ON s.user_id = u.id
    `;

    const params = [];
    const conditions = [];

    if (userId) {
      conditions.push(`s.user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (revenueShareStatus) {
      conditions.push(`s.revenue_share_status = $${params.length + 1}`);
      params.push(revenueShareStatus);
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ` + conditions.join(' AND ');
    }

    queryText += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryText, params);

    // Calculate totals
    const totalsResult = await query(`
      SELECT
        COUNT(*) as total_sales,
        SUM(sale_amount) as total_revenue,
        SUM(revenue_share_amount) as total_revenue_share,
        SUM(CASE WHEN revenue_share_status = 'pending' THEN revenue_share_amount ELSE 0 END) as pending_revenue_share
      FROM inspector_sales
      ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
    `, params.slice(0, -2)); // Remove limit/offset params

    res.json({
      sales: result.rows,
      totals: {
        totalSales: parseInt(totalsResult.rows[0].total_sales) || 0,
        totalRevenue: parseInt(totalsResult.rows[0].total_revenue) || 0,
        totalRevenueShare: parseInt(totalsResult.rows[0].total_revenue_share) || 0,
        pendingRevenueShare: parseInt(totalsResult.rows[0].pending_revenue_share) || 0
      }
    });
  } catch (error) {
    console.error('[Admin] Get sales error:', error);
    res.status(500).json({ error: 'Failed to retrieve sales' });
  }
});

/**
 * GET /api/admin/sales/:userId
 * Get sales for specific inspector
 */
router.get('/sales/:userId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT * FROM inspector_sales
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    // Calculate inspector totals
    const totalsResult = await query(`
      SELECT
        COUNT(*) as total_sales,
        SUM(sale_amount) as total_revenue,
        SUM(revenue_share_amount) as total_owed,
        SUM(CASE WHEN revenue_share_status = 'paid' THEN revenue_share_amount ELSE 0 END) as total_paid,
        SUM(CASE WHEN revenue_share_status = 'pending' THEN revenue_share_amount ELSE 0 END) as total_pending
      FROM inspector_sales
      WHERE user_id = $1
    `, [userId]);

    res.json({
      sales: result.rows,
      totals: totalsResult.rows[0]
    });
  } catch (error) {
    console.error('[Admin] Get inspector sales error:', error);
    res.status(500).json({ error: 'Failed to retrieve inspector sales' });
  }
});

/**
 * PATCH /api/admin/sales/:saleId/revenue-share
 * Mark revenue share as paid
 */
router.patch('/sales/:saleId/revenue-share', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { saleId } = req.params;
    const { status } = req.body;

    if (!['paid', 'pending', 'overdue'].includes(status)) {
      return res.status(400).json({ error: 'Invalid revenue share status' });
    }

    const result = await query(
      `UPDATE inspector_sales
       SET revenue_share_status = $2,
           revenue_share_paid_at = ${status === 'paid' ? 'NOW()' : 'NULL'}
       WHERE id = $1
       RETURNING *`,
      [saleId, status]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json({
      message: 'Revenue share updated successfully',
      sale: result.rows[0]
    });
  } catch (error) {
    console.error('[Admin] Update revenue share error:', error);
    res.status(500).json({ error: 'Failed to update revenue share' });
  }
});

/**
 * GET /api/admin/territories
 * Get all territories
 */
router.get('/territories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await query(`
      SELECT t.*,
             (SELECT COUNT(*) FROM users WHERE territory = t.territory_name AND license_status = 'active') as active_inspectors
      FROM territories t
      ORDER BY territory_name
    `);

    res.json({
      territories: result.rows
    });
  } catch (error) {
    console.error('[Admin] Get territories error:', error);
    res.status(500).json({ error: 'Failed to retrieve territories' });
  }
});

/**
 * POST /api/admin/territories
 * Create new territory
 */
router.post('/territories', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      territoryName,
      country = 'USA',
      state,
      city,
      zipCodes = [],
      maxInspectors = 5
    } = req.body;

    if (!territoryName) {
      return res.status(400).json({ error: 'Territory name is required' });
    }

    const result = await query(
      `INSERT INTO territories (territory_name, country, state, city, zip_codes, max_inspectors)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [territoryName, country, state, city, zipCodes, maxInspectors]
    );

    res.json({
      message: 'Territory created successfully',
      territory: result.rows[0]
    });
  } catch (error) {
    console.error('[Admin] Create territory error:', error);
    res.status(500).json({ error: 'Failed to create territory' });
  }
});

export default router;
