import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const menuRouter = createTRPCRouter({
  // Category operations
  createCategory: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify restaurant ownership
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          id: input.restaurantId,
          userId: ctx.user.id,
        },
      });

      if (!restaurant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restaurant not found",
        });
      }

      const category = await ctx.db.category.create({
        data: {
          name: input.name,
          restaurantId: input.restaurantId,
        },
      });

      return category;
    }),

  updateCategory: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through restaurant
      const category = await ctx.db.category.findFirst({
        where: { id: input.id },
        include: { restaurant: true },
      });

      if (!category || category.restaurant.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      const updated = await ctx.db.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });

      return updated;
    }),

  deleteCategory: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through restaurant
      const category = await ctx.db.category.findFirst({
        where: { id: input.id },
        include: { restaurant: true },
      });

      if (!category || category.restaurant.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      await ctx.db.category.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  // Dish operations
  createDish: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
        image: z.union([z.string().url(), z.literal("")]).optional(),
        spiceLevel: z.number().min(0).max(5).optional(),
        price: z.string().optional(),
        categoryIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify restaurant ownership
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          id: input.restaurantId,
          userId: ctx.user.id,
        },
      });

      if (!restaurant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restaurant not found",
        });
      }

      // Create dish
      const dish = await ctx.db.dish.create({
        data: {
          name: input.name,
          description: input.description,
          image: input.image && input.image.trim() !== "" ? input.image : null,
          spiceLevel: input.spiceLevel,
          price: input.price,
          restaurantId: input.restaurantId,
          categories: input.categoryIds
            ? {
                create: input.categoryIds.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      return dish;
    }),

  updateDish: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional().nullable(),
        image: z.union([z.string().url(), z.literal("")]).optional().nullable(),
        spiceLevel: z.number().min(0).max(5).optional().nullable(),
        price: z.string().optional().nullable(),
        categoryIds: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through restaurant
      const dish = await ctx.db.dish.findFirst({
        where: { id: input.id },
        include: { restaurant: true },
      });

      if (!dish || dish.restaurant.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dish not found",
        });
      }

      // Update dish
      const updated = await ctx.db.dish.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.image !== undefined && { image: input.image && input.image.trim() !== "" ? input.image : null }),
          ...(input.spiceLevel !== undefined && { spiceLevel: input.spiceLevel }),
          ...(input.price !== undefined && { price: input.price }),
        },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      });

      // Update categories if provided
      if (input.categoryIds !== undefined) {
        // Remove all existing category associations
        await ctx.db.dishCategory.deleteMany({
          where: { dishId: input.id },
        });

        // Create new associations
        if (input.categoryIds.length > 0) {
          await ctx.db.dishCategory.createMany({
            data: input.categoryIds.map((categoryId) => ({
              dishId: input.id,
              categoryId,
            })),
          });
        }

        // Fetch updated dish with categories
        const dishWithCategories = await ctx.db.dish.findUnique({
          where: { id: input.id },
          include: {
            categories: {
              include: {
                category: true,
              },
            },
          },
        });

        return dishWithCategories ?? updated;
      }

      return updated;
    }),

  deleteDish: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through restaurant
      const dish = await ctx.db.dish.findFirst({
        where: { id: input.id },
        include: { restaurant: true },
      });

      if (!dish || dish.restaurant.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Dish not found",
        });
      }

      await ctx.db.dish.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),

  getDishesByRestaurant: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify restaurant ownership
      const restaurant = await ctx.db.restaurant.findFirst({
        where: {
          id: input.restaurantId,
          userId: ctx.user.id,
        },
      });

      if (!restaurant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restaurant not found",
        });
      }

      const dishes = await ctx.db.dish.findMany({
        where: { restaurantId: input.restaurantId },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return dishes;
    }),
});

