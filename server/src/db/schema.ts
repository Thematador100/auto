import { pgTable, text, timestamp, jsonb, uuid, varchar, integer } from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  plan: varchar('plan', { length: 50 }).notNull().default('pro'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  vin: varchar('vin', { length: 17 }).notNull(),
  year: varchar('year', { length: 4 }).notNull(),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Reports table
export const reports = pgTable('reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  vehicleId: uuid('vehicle_id').references(() => vehicles.id).notNull(),
  reportData: jsonb('report_data').notNull(), // Stores the complete report JSON
  summary: jsonb('summary').notNull(),
  vehicleHistory: jsonb('vehicle_history'),
  safetyRecalls: jsonb('safety_recalls'),
  theftAndSalvage: jsonb('theft_and_salvage'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// AI Request Logs (for tracking usage and costs)
export const aiRequestLogs = pgTable('ai_request_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'gemini' or 'deepseek'
  requestType: varchar('request_type', { length: 100 }).notNull(), // 'dtc_analysis', 'report_summary', etc.
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type AIRequestLog = typeof aiRequestLogs.$inferSelect;
export type NewAIRequestLog = typeof aiRequestLogs.$inferInsert;
