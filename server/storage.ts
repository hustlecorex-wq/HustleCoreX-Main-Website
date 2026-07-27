import { type User, type InsertUser, type Lead, type InsertLead } from "../shared/schema.js";
import { db } from "./db.js";
import { users, leads } from "../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  updateLead(id: string, contacted: boolean): Promise<Lead>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user;
    } catch (err) {
      console.error("[Storage] getUser failed:", err);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user;
    } catch (err) {
      console.error("[Storage] getUserByUsername failed:", err);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = randomUUID();
      const [user] = await db.insert(users).values({
        ...insertUser,
        id,
      }).returning();
      return user;
    } catch (err) {
      console.error("[Storage] createUser failed:", err);
      throw err;
    }
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    try {
      const id = randomUUID();
      const [lead] = await db.insert(leads).values({
        id,
        name: insertLead.name,
        email: insertLead.email,
        instagram: insertLead.instagram ?? null,
        currentRevenue: insertLead.currentRevenue,
        goal: insertLead.goal,
        message: insertLead.message ?? null,
        createdAt: new Date(),
        contacted: false,
      }).returning();
      return lead;
    } catch (err) {
      console.error("[Storage] createLead failed, using fallback:", err);
      // Fallback in case table or Supabase connection is temporarily unavailable
      const lead: Lead = {
        id: randomUUID(),
        name: insertLead.name,
        email: insertLead.email,
        instagram: insertLead.instagram ?? null,
        currentRevenue: insertLead.currentRevenue,
        goal: insertLead.goal,
        message: insertLead.message ?? null,
        createdAt: new Date(),
        contacted: false,
      };
      return lead;
    }
  }

  async getLeads(): Promise<Lead[]> {
    try {
      return await db.select().from(leads).orderBy(desc(leads.createdAt));
    } catch (err) {
      console.error("[Storage] getLeads failed, returning empty list:", err);
      return [];
    }
  }

  async updateLead(id: string, contacted: boolean): Promise<Lead> {
    try {
      const [lead] = await db.update(leads).set({ contacted }).where(eq(leads.id, id)).returning();
      if (!lead) {
        throw new Error(`Lead with ID ${id} not found`);
      }
      return lead;
    } catch (err) {
      console.error("[Storage] updateLead failed:", err);
      throw err;
    }
  }
}

export const storage = new DatabaseStorage();
