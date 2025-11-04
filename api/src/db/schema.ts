import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, index, check, unique, boolean } from 'drizzle-orm/pg-core';

// Helper to generate xid - using require to avoid ESM/CJS issues with drizzle-kit
const generateXid = () => {
  const { Xid } = require('xid-ts');
  return new Xid().toString();
};

export const channels = pgTable(
  'channels',
  {
    id: text('id').primaryKey().$defaultFn(generateXid),
    name: text('name').notNull(),
    isPrivate: boolean('is_private').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    uniquNameIdx: unique('channels_unique_name_idx').on(table.name),
    nameLowercaseCheck: check('name_lowercase_check', sql`${table.name} = LOWER(${table.name})`),
  })
);

export const messages = pgTable(
  'messages',
  {
    id: text('id').primaryKey().$defaultFn(generateXid),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(), // Clerk user ID
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    channelIdIdx: index('messages_channel_id_idx').on(table.channelId),
    userIdIdx: index('messages_user_id_idx').on(table.userId),
    createdAtIdx: index('messages_created_at_idx').on(table.createdAt),
  })
);

export const channelMembers = pgTable(
  'channel_members',
  {
    id: text('id').primaryKey().$defaultFn(generateXid),
    channelId: text('channel_id')
      .notNull()
      .references(() => channels.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull(), // Clerk user ID
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  table => ({
    channelIdIdx: index('channel_members_channel_id_idx').on(table.channelId),
    userIdIdx: index('channel_members_user_id_idx').on(table.userId),
  })
);

// Create types
export type Channel = typeof channels.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ChannelMember = typeof channelMembers.$inferSelect;
