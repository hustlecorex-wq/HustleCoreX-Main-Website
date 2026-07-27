import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const MAILCHIMP_STATUSES = [
  "pending",
  "subscribed",
  "failed",
  "skipped",
] as const;

export type MailchimpStatus = (typeof MAILCHIMP_STATUSES)[number];

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  instagram: text("instagram"),
  currentRevenue: text("current_revenue").notNull(),
  goal: text("goal").notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  contacted: boolean("contacted").default(false).notNull(),
  // Records how far this lead got with the newsletter audience:
  // "pending" awaiting confirmation, "subscribed" confirmed, "failed" rejected
  // by Mailchimp, "skipped" not attempted (no consent, or not configured).
  mailchimpStatus: text("mailchimp_status")
    .$type<MailchimpStatus>()
    .default("skipped")
    .notNull(),
});

export const insertLeadSchema = createInsertSchema(leads).pick({
  name: true,
  email: true,
  instagram: true,
  currentRevenue: true,
  goal: true,
  message: true,
});

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
