/**
 * Fix admin user's user_type in database
 * This will make the admin dashboard appear when you login
 *
 * Run on Railway: railway run node backend/fix-admin-usertype.js
 */

import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found');
  console.log('Run with: railway run node backend/fix-admin-usertype.js');
  process.exit(1);
}

async function fixAdmin() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Update admin user to have correct user_type
    const result = await client.query(
      `UPDATE users
       SET user_type = 'admin', plan = 'admin'
       WHERE email = 'admin@test.com'
       RETURNING email, user_type, plan`
    );

    if (result.rows.length > 0) {
      console.log('✅ Fixed admin user!');
      console.log('Email:', result.rows[0].email);
      console.log('User Type:', result.rows[0].user_type);
      console.log('Plan:', result.rows[0].plan);
      console.log('\n🎉 Now login and you\'ll see the Admin Dashboard!');
    } else {
      console.log('⚠️  No admin user found with email admin@test.com');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixAdmin();
