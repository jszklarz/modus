import { sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/gel-core';
import { pgTable, text, timestamp, index, check, unique, boolean } from 'drizzle-orm/pg-core';

// Helper to generate ksuid - using require to avoid ESM/CJS issues with drizzle-kit
const generateKsuid = (prefix?: string) => {
  const KSUID = require('ksuid');

  if (prefix) {
    return `${prefix}_${KSUID.randomSync().string}`;
  }

  return KSUID.randomSync().string;
};

export const userProfiles = pgTable(
  'user_profiles',
  {
    userId: text('user_id').primaryKey(), // Clerk user ID
    alias: text('alias').notNull(), // Global unique alias
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    uniqueAliasIdx: unique('user_profiles_unique_alias_idx').on(table.alias),
    aliasIdx: index('user_profiles_alias_idx').on(table.alias),
  })
);

export const orgMembers = pgTable(
  'org_members',
  {
    id: text('id').primaryKey().$defaultFn(generateKsuid),
    orgId: text('org_id').notNull(), // Clerk organization ID
    userId: text('user_id').notNull(), // Clerk user ID
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    orgIdIdx: index('org_members_org_id_idx').on(table.orgId),
    userIdIdx: index('org_members_user_id_idx').on(table.userId),
    // Composite index for org-scoped queries (search users in org)
    orgUserIdx: index('org_members_org_user_idx').on(table.orgId, table.userId),
    // User can only be in an org once
    uniqueOrgUserIdx: unique('org_members_unique_org_user_idx').on(table.orgId, table.userId),
  })
);

export const channels = pgTable(
  'channels',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => generateKsuid('chan')),
    orgId: text('org_id').notNull(),
    ownerId: text('owner_id').notNull(),
    name: text('name').notNull(),
    isPrivate: boolean('is_private').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  table => ({
    uniqueOrgNameIdx: unique('channels_unique_org_name_idx').on(table.orgId, table.name),
    nameLowercaseCheck: check('name_lowercase_check', sql`${table.name} = LOWER(${table.name})`),
    orgIdIdx: index('channels_org_id_idx').on(table.orgId),
  })
);

export const messages = pgTable(
  'messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => generateKsuid('msg')),
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
    id: text('id').primaryKey().$defaultFn(generateKsuid),
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
export type UserProfile = typeof userProfiles.$inferSelect;
export type OrgMember = typeof orgMembers.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type ChannelMember = typeof channelMembers.$inferSelect;
