import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const publicRouter = createTRPCRouter({
  // Public endpoint to get restaurant menu (for customer view via QR code or link)
  getMenu: publicProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const restaurant = await ctx.db.restaurant.findUnique({
        where: { id: input.restaurantId },
        include: {
          categories: {
            orderBy: { name: "asc" },
            include: {
              dishes: {
                include: {
                  dish: {
                    include: {
                      categories: {
                        include: {
                          category: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!restaurant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Restaurant not found",
        });
      }

      // Transform the data to make it easier to work with
      const categories = restaurant.categories.map((category) => ({
        id: category.id,
        name: category.name,
        dishes: category.dishes.map((dc) => ({
          id: dc.dish.id,
          name: dc.dish.name,
          description: dc.dish.description,
          image: dc.dish.image,
          spiceLevel: dc.dish.spiceLevel,
          price: dc.dish.price,
          categories: dc.dish.categories.map((dc2) => ({
            id: dc2.category.id,
            name: dc2.category.name,
          })),
        })),
      }));

      // Also get all dishes to handle dishes that might be in multiple categories
      const allDishes = await ctx.db.dish.findMany({
        where: { restaurantId: input.restaurantId },
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return {
        id: restaurant.id,
        name: restaurant.name,
        location: restaurant.location,
        categories,
        allDishes: allDishes.map((dish) => ({
          id: dish.id,
          name: dish.name,
          description: dish.description,
          image: dish.image,
          spiceLevel: dish.spiceLevel,
          price: dish.price,
          categories: dish.categories.map((dc) => ({
            id: dc.category.id,
            name: dc.category.name,
          })),
        })),
      };
    }),
});

