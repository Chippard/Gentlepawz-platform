import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, longtext } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

/**
 * Core user table backing auth flow.
 * Extended with role field to support owners, walkers, and customers.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // For email/password auth
  loginMethod: varchar("loginMethod", { length: 64 }), // "manus", "email", etc.
  role: mysqlEnum("role", ["customer", "walker", "admin"]).default("customer").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Walker profiles — extended information for walkers/sitters
 */
export const walkerProfiles = mysqlTable("walker_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bio: longtext("bio"),
  photo: varchar("photo", { length: 512 }), // URL to photo
  skills: text("skills"), // JSON array of skills
  certifications: text("certifications"), // JSON array
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: int("reviewCount").default(0),
  repeatClients: int("repeatClients").default(0),
  pricePerDay: decimal("pricePerDay", { precision: 6, scale: 2 }).default("40"),
  pricePerNight: decimal("pricePerNight", { precision: 6, scale: 2 }).default("60"),
  pricePerHour: decimal("pricePerHour", { precision: 6, scale: 2 }).default("30"),
  location: varchar("location", { length: 255 }),
  availability: text("availability"), // JSON object with availability schedule
  nonSmokingHousehold: boolean("nonSmokingHousehold").default(true),
  otherPets: text("otherPets"),
  children: boolean("children").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WalkerProfile = typeof walkerProfiles.$inferSelect;
export type InsertWalkerProfile = typeof walkerProfiles.$inferInsert;

/**
 * Bookings — dog care bookings (day care, boarding, walks)
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  walkerId: int("walkerId").notNull(),
  serviceType: mysqlEnum("serviceType", ["daycare", "boarding", "walk"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  dogName: varchar("dogName", { length: 255 }),
  specialRequests: text("specialRequests"),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Messages — communication between customers and walkers
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId"),
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId").notNull(),
  content: longtext("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Reviews — customer reviews of walkers
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(),
  customerId: int("customerId").notNull(),
  walkerId: int("walkerId").notNull(),
  rating: int("rating").notNull(), // 1-5
  comment: longtext("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Relations
 */
export const userRelations = relations(users, ({ many, one }) => ({
  walkerProfile: one(walkerProfiles, {
    fields: [users.id],
    references: [walkerProfiles.userId],
  }),
  bookingsAsCustomer: many(bookings, {
    relationName: "customer",
  }),
  bookingsAsWalker: many(bookings, {
    relationName: "walker",
  }),
  reviews: many(reviews),
  messagesSent: many(messages, {
    relationName: "sender",
  }),
  messagesReceived: many(messages, {
    relationName: "recipient",
  }),
}));

export const walkerProfileRelations = relations(walkerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [walkerProfiles.userId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
}));

export const bookingRelations = relations(bookings, ({ one, many }) => ({
  customer: one(users, {
    fields: [bookings.customerId],
    references: [users.id],
    relationName: "customer",
  }),
  walker: one(users, {
    fields: [bookings.walkerId],
    references: [users.id],
    relationName: "walker",
  }),
  messages: many(messages),
  review: one(reviews),
}));

export const messageRelations = relations(messages, ({ one }) => ({
  booking: one(bookings, {
    fields: [messages.bookingId],
    references: [bookings.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  recipient: one(users, {
    fields: [messages.recipientId],
    references: [users.id],
    relationName: "recipient",
  }),
}));

export const reviewRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
  walker: one(users, {
    fields: [reviews.walkerId],
    references: [users.id],
  }),
}));
