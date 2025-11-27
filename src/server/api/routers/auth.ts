import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  generateVerificationCode,
  verifyCode,
  createSession,
  deleteSession,
} from "~/server/auth";
import { TRPCError } from "@trpc/server";

export const authRouter = createTRPCRouter({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        fullName: z.string().min(1),
        country: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();

      // Check if user already exists
      const existingUser = await ctx.db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "User with this email already exists",
        });
      }

      // Create user (unverified) with the provided data
      await ctx.db.user.create({
        data: {
          email: normalizedEmail,
          fullName: input.fullName.trim(),
          country: input.country.trim(),
          emailVerified: false,
        },
      });

      // Generate and send verification code
      await generateVerificationCode(normalizedEmail);

      return { success: true, message: "Verification code sent to your email" };
    }),

  sendVerificationCode: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();

      // Check if user exists
      const user = await ctx.db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. Please register first.",
        });
      }

      // Generate and send verification code
      await generateVerificationCode(normalizedEmail);

      return { success: true, message: "Verification code sent to your email" };
    }),

  verifyAndLogin: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        code: z.string().min(6).max(6),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const normalizedEmail = input.email.toLowerCase().trim();
      const normalizedCode = input.code.trim();

      // Verify the code
      const isValid = await verifyCode(normalizedEmail, normalizedCode);

      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired verification code",
        });
      }

      // Get user
      let user = await ctx.db.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found. Please register first.",
        });
      }

      // Mark email as verified if not already
      if (!user.emailVerified) {
        user = await ctx.db.user.update({
          where: { id: user.id },
          data: { emailVerified: true },
        });
      }

      // Create session
      const token = await createSession(user.id);

      return {
        success: true,
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          country: user.country,
        },
      };
    }),

  logout: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }) => {
      await deleteSession(input.token);
      return { success: true };
    }),

  me: publicProcedure
    .input(z.object({ token: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (!input.token && !ctx.session) {
        return null;
      }

      const session = input.token
        ? await import("~/server/auth").then((m) => m.getSession(input.token!))
        : ctx.session;

      if (!session) {
        return null;
      }

      return {
        id: session.user.id,
        email: session.user.email,
        fullName: session.user.fullName,
        country: session.user.country,
      };
    }),
});

