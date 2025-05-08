// schema.ts
import { pgTable, bigserial, varchar, integer, doublePrecision, timestamp, index, bigint } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Items Table: Stores the unique items being tracked
export const items = pgTable('items', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    market_hash_name: varchar('market_hash_name', { length: 255 }).notNull().unique(),
    steam_appid: integer('steam_appid').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (items) => ({
    marketHashNameIdx: index('market_hash_name_idx').on(items.market_hash_name),
}));

// Price History Table: Logs the price of each item over time
export const priceHistory = pgTable('price_history', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    itemId: bigint('item_id', { mode: 'number' }).notNull().references(() => items.id, { onDelete: 'cascade' }),
    price: doublePrecision('price').notNull(),
    recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
}, (priceHistory) => ({
    itemIdIdx: index('item_id_idx').on(priceHistory.itemId),
    recordedAtIdx: index('recorded_at_idx').on(priceHistory.recordedAt),
    itemIdRecordedAtIdx: index('item_id_recorded_at_idx').on(priceHistory.itemId, priceHistory.recordedAt),
}));

// Define relations
export const itemsRelations = relations(items, ({ many }) => ({
    priceHistory: many(priceHistory),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
    item: one(items, {
        fields: [priceHistory.itemId],
        references: [items.id],
    }),
}));