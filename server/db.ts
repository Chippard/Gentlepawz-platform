import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, walkerProfiles, bookings, reviews, messages } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
      email: user.email || `user-${user.openId}@gentlepawz.local`,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWalkerProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(walkerProfiles).where(eq(walkerProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getWalkerReviews(walkerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(reviews).where(eq(reviews.walkerId, walkerId));
}

export async function getBookingsByCustomer(customerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookings).where(eq(bookings.customerId, customerId));
}

export async function getBookingsByWalker(walkerId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(bookings).where(eq(bookings.walkerId, walkerId));
}

export async function getMessages(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messages).where(
    or(eq(messages.senderId, userId), eq(messages.recipientId, userId))
  );
}

export async function getMessagesByBooking(bookingId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(messages).where(eq(messages.bookingId, bookingId));
}

// Admin helpers
export async function getUserCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(users);
  return result.length;
}

export async function getWalkerCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(walkerProfiles);
  return result.length;
}

export async function getActiveBookingCount() {
  const db = await getDb();
  if (!db) return 0;
  try {
    const result = await db.select().from(bookings).where(
      eq(bookings.status, 'confirmed')
    );
    return result.length;
  } catch (error) {
    return 0;
  }
}

export async function getReviewCount() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(reviews);
  return result.length;
}

export async function getAverageRating() {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(reviews);
  if (result.length === 0) return 0;
  const sum = result.reduce((acc, r) => acc + (r.rating || 0), 0);
  return Math.round((sum / result.length) * 10) / 10;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(users);
  } catch (error) {
    console.warn("[Database] Failed to fetch users:", error);
    return [];
  }
}

export async function getAllWalkerProfiles() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(walkerProfiles);
}

export async function getAllBookings() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(bookings);
  } catch (error) {
    console.warn("[Database] Failed to fetch bookings:", error);
    return [];
  }
}

export async function getRecentBookings(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  try {
    const result = await db.select().from(bookings);
    return result.slice(-limit).reverse();
  } catch (error) {
    console.warn("[Database] Failed to fetch recent bookings:", error);
    return [];
  }
}
