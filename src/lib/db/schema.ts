import { pgTable, text, timestamp, integer, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

export const fonts = pgTable('fonts', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull(),
  originalName: text('original_name').notNull(),
  standardizedName: text('standardized_name').notNull(),
  weight: text('weight'),
  style: text('style'),
  source: text('source'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  parentId: uuid('parent_id'),
  domain: text('domain'),
  identified: boolean('identified').default(false),
  confidence: integer('confidence'),
  createdAt: timestamp('created_at').defaultNow(),
});