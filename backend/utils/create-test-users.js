import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

/**
 * Create test admin user for platform testing
 * Email: admin@test.com
 * Password: admin123
 */

async function createTestAdmin() {
  try {
    console.log('🔐 Creating test admin user...');

    const email = 'admin@test.com';
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if admin already exists
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);

    if (existing.rows.length > 0) {
      console.log('✅ Test admin already exists');
      console.log('\nLogin credentials:');
      console.log('Email: admin@test.com');
      console.log('Password: admin123');
      return;
    }

    // Create admin user
    await query(
      `INSERT INTO users (
        email,
        password_hash,
        user_type,
        company_name,
        plan,
        inspection_credits,
        subscription_status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [email, passwordHash, 'admin', 'Platform Admin', 'admin', -1, 'active']
    );

    console.log('✅ Test admin created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@test.com');
    console.log('Password: admin123');
    console.log('\nYou can now login to the platform and access all features.');

    // Create test Pro inspector
    const proEmail = 'inspector@test.com';
    const proPassword = 'inspector123';
    const proPasswordHash = await bcrypt.hash(proPassword, 10);

    await query(
      `INSERT INTO users (
        email,
        password_hash,
        user_type,
        company_name,
        plan,
        inspection_credits,
        subscription_status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [proEmail, proPasswordHash, 'pro', 'Test Inspections Inc', 'pro-basic', -1, 'active']
    );

    console.log('\n✅ Test Pro inspector created!');
    console.log('Email: inspector@test.com');
    console.log('Password: inspector123');

    // Create test DIY user
    const diyEmail = 'buyer@test.com';
    const diyPassword = 'buyer123';
    const diyPasswordHash = await bcrypt.hash(diyPassword, 10);

    await query(
      `INSERT INTO users (
        email,
        password_hash,
        user_type,
        company_name,
        plan,
        inspection_credits,
        subscription_status,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [diyEmail, diyPasswordHash, 'diy', 'John Smith', 'diy-5pack', 5, 'pay_per_use']
    );

    console.log('\n✅ Test DIY buyer created!');
    console.log('Email: buyer@test.com');
    console.log('Password: buyer123');
    console.log('\n📝 All test accounts created. Start the frontend to login.');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    process.exit(0);
  }
}

createTestAdmin();
