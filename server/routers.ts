import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  contact: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1, "Name is required"),
          email: z.string().email("Valid email is required"),
          phone: z.string().optional().default(""),
          dogName: z.string().optional().default(""),
          service: z.string().optional().default(""),
          message: z.string().min(1, "Message is required"),
        })
      )
      .mutation(async ({ input }) => {
        const serviceLabels: Record<string, string> = {
          daycare: "Doggy Day Care ($40/day)",
          boarding: "Overnight Boarding ($60/night)",
          walks: "Dog Walks ($30/hour)",
          other: "Other / General Inquiry",
        };

        const serviceLabel = input.service
          ? serviceLabels[input.service] || input.service
          : "Not specified";

        const content = [
          `**New Contact Form Submission**`,
          ``,
          `**Name:** ${input.name}`,
          `**Email:** ${input.email}`,
          input.phone ? `**Phone:** ${input.phone}` : null,
          input.dogName ? `**Dog's Name:** ${input.dogName}` : null,
          `**Service:** ${serviceLabel}`,
          ``,
          `**Message:**`,
          input.message,
        ]
          .filter(Boolean)
          .join("\n");

        const notified = await notifyOwner({
          title: `New Inquiry from ${input.name}`,
          content,
        });

        if (!notified) {
          console.warn(`[Contact] Owner notification failed for submission from ${input.email}`);
        }

        return { success: true, notified } as const;
      }),
  }),

  walkers: router({
    list: publicProcedure.query(async () => {
      // Return public walker profiles
      // For now, return Emily's profile
      return [
        {
          id: 1,
          userId: 1,
          name: "Emily S.",
          title: "Star Sitter",
          rating: 4.9,
          reviewCount: 93,
          repeatClients: 28,
          location: "North Vancouver, BC",
          tagline: "The best care for your best friend",
          bio: "Active individual who loves adventures with dogs. Worked at a pet hospital for over a year caring for boarding animals.",
          photo: "https://d2xsxph8kpxj0f.cloudfront.net/310519663631703889/HyjFhWM4C2oWxo7dXTLa4r/emily-profile-LdJXrzG5WUi2WX44Z5RGtf.webp",
        },
      ];
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getWalkerProfile(input.id);
        return profile || null;
      }),

    getReviews: publicProcedure
      .input(z.object({ walkerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getWalkerReviews(input.walkerId);
      }),
  }),

  bookings: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "customer") {
        return await db.getBookingsByCustomer(ctx.user.id);
      } else if (ctx.user.role === "walker") {
        return await db.getBookingsByWalker(ctx.user.id);
      }
      return [];
    }),

    create: protectedProcedure
      .input(
        z.object({
          walkerId: z.number(),
          dogName: z.string(),
          service: z.enum(["daycare", "boarding", "walks"]),
          startDate: z.date(),
          endDate: z.date(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "customer") {
          throw new Error("Only customers can create bookings");
        }

        // TODO: Insert booking into database
        return {
          success: true,
          bookingId: 1,
        };
      }),

    accept: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "walker") {
          throw new Error("Only walkers can accept bookings");
        }

        // TODO: Update booking status to accepted
        return { success: true };
      }),

    decline: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "walker") {
          throw new Error("Only walkers can decline bookings");
        }

        // TODO: Update booking status to declined
        return { success: true };
      }),
  }),

  messages: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getMessages(ctx.user.id);
    }),

    getByBooking: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return await db.getMessagesByBooking(input.bookingId);
      }),

    send: protectedProcedure
      .input(
        z.object({
          recipientId: z.number(),
          bookingId: z.number(),
          content: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // TODO: Insert message into database
        return {
          success: true,
          messageId: 1,
        };
      }),
  }),

  reviews: router({
    create: protectedProcedure
      .input(
        z.object({
          walkerId: z.number(),
          bookingId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string().min(1),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== "customer") {
          throw new Error("Only customers can leave reviews");
        }

        // TODO: Insert review into database
        return {
          success: true,
          reviewId: 1,
        };
      }),
  }),

  admin: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const userCount = await db.getUserCount();
      const walkerCount = await db.getWalkerCount();
      const bookingCount = await db.getActiveBookingCount();
      const reviewCount = await db.getReviewCount();
      const avgRating = await db.getAverageRating();

      return {
        totalUsers: userCount,
        totalWalkers: walkerCount,
        activeBookings: bookingCount,
        totalReviews: reviewCount,
        avgRating: avgRating || 0,
        monthlyRevenue: 0,
      };
    }),

    listUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await db.getAllUsers();
    }),

    listWalkers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await db.getAllWalkerProfiles();
    }),

    listBookings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      return await db.getAllBookings();
    }),

    getRecentBookings: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("Admin access required");
        }

        return await db.getRecentBookings(input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
