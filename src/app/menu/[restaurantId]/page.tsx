"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import QRCode from "qrcode";

export default function MenuPage() {
  const params = useParams();
  const restaurantId = params.restaurantId as string;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const categoryRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { data: menu } = api.public.getMenu.useQuery(
    { restaurantId },
    { enabled: !!restaurantId }
  );

  useEffect(() => {
    if (menu && menu.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(menu.categories[0]?.id ?? null);
    }
  }, [menu, selectedCategory]);

  useEffect(() => {
    // Generate QR code
    if (typeof window !== "undefined" && restaurantId) {
      const menuUrl = `http://192.168.1.24:3000/menu/${restaurantId}`;
      QRCode.toDataURL(menuUrl)
        .then((url) => {
          setQrCodeUrl(url);
        })
        .catch((err) => {
          console.error("Error generating QR code:", err);
        });
    }
  }, [restaurantId]);

  const scrollToCategory = (categoryId: string) => {
    const element = categoryRefs.current[categoryId];
    if (element) {
      const headerHeight = 140; // Approximate height of fixed headers
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
      setSelectedCategory(categoryId);
    }
  };

  // Track scroll position to update selected category
  useEffect(() => {
    const handleScroll = () => {
      if (!menu) return;

      const headerHeight = 140;
      const scrollPosition = window.scrollY + headerHeight + 50;

      for (const category of menu.categories) {
        const element = categoryRefs.current[category.id];
        if (element) {
          const elementTop = element.offsetTop;
          const elementBottom = elementTop + element.offsetHeight;

          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setSelectedCategory(category.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menu]);

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div>Loading menu...</div>
      </div>
    );
  }

  // Get all unique categories from all dishes
  const allCategories = menu.categories;
  const categoryMap = new Map(allCategories.map((cat) => [cat.id, cat]));

  // Group dishes by category for display
  const dishesByCategory = new Map<string, typeof menu.allDishes>();
  allCategories.forEach((category) => {
    const dishes = menu.allDishes.filter((dish) =>
      dish.categories.some((dc) => dc.id === category.id)
    );
    dishesByCategory.set(category.id, dishes);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Fixed */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">{menu.name}</h1>
          <p className="text-sm text-gray-600">{menu.location}</p>
        </div>
      </div>

      {/* Category Tabs - Fixed below header */}
      <div className="sticky top-[73px] z-10 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto py-3">
            {allCategories.map((category) => {
              const dishCount = dishesByCategory.get(category.id)?.length ?? 0;
              return (
                <button
                  key={category.id}
                  onClick={() => scrollToCategory(category.id)}
                  className={`whitespace-nowrap px-4 py-2 font-semibold transition-colors ${
                    selectedCategory === category.id
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {category.name} ({dishCount})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="container mx-auto px-4 py-6">
        {allCategories.map((category) => {
          const dishes = dishesByCategory.get(category.id) ?? [];
          if (dishes.length === 0) return null;

          return (
            <div
              key={category.id}
              ref={(el) => {
                categoryRefs.current[category.id] = el;
              }}
              className="mb-8"
            >
              {/* Category Header */}
              <h2 className="mb-4 text-xl font-bold">{category.name}</h2>

              {/* Dishes */}
              <div className="space-y-6">
                {dishes.map((dish) => (
                  <div key={dish.id} className="flex gap-4">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        {/* Dietary indicator - simplified for now */}
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        {dish.spiceLevel !== null &&
                          dish.spiceLevel !== undefined &&
                          Array.from({ length: dish.spiceLevel }).map((_, i) => (
                            <span key={i} className="text-red-500">
                              🌶️
                            </span>
                          ))}
                      </div>
                      <h3 className="text-lg font-semibold">{dish.name}</h3>
                      {dish.price && (
                        <p className="mb-2 text-lg font-semibold text-gray-900">{dish.price}</p>
                      )}
                      {dish.description && (
                        <p className="mb-2 text-sm text-gray-600 line-clamp-3">
                          {dish.description}
                        </p>
                      )}
                    </div>
                    {dish.image && (
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full">
                        <img
                          src={dish.image}
                          alt={dish.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Menu Button */}
      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 z-50 h-14 rounded-full bg-pink-500 px-6 text-white shadow-lg hover:bg-pink-600"
            size="lg"
          >
            <span className="mr-2">☰</span>
            Menu
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Menu Categories</DialogTitle>
            <DialogDescription>Select a category to navigate</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {allCategories.map((category) => {
              const dishCount = dishesByCategory.get(category.id)?.length ?? 0;
              return (
                <div
                  key={category.id}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-sm text-gray-500">{dishCount} items</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      scrollToCategory(category.id);
                      setIsMenuDialogOpen(false);
                    }}
                  >
                    View
                  </Button>
                </div>
              );
            })}
          </div>
          {qrCodeUrl && (
            <div className="mt-6 border-t pt-6">
              <p className="mb-4 text-center font-semibold">Share Menu</p>
              <div className="flex flex-col items-center gap-4">
                <img src={qrCodeUrl} alt="QR Code" className="h-48 w-48" />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `http://192.168.1.24:3000/menu/${restaurantId}`
                    );
                    alert("Link copied to clipboard!");
                  }}
                >
                  Copy Link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

