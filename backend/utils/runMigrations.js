import { query } from '../config/database.js';

// Simple migration runner that adds missing columns to users table
export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  try {
    // Add missing columns if they don't exist
    await query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
      ADD COLUMN IF NOT EXISTS phone VARCHAR(50),
      ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
    `);
    
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    // Don't crash the server if migrations fail
  }
}
