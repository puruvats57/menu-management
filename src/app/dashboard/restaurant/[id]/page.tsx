"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import Link from "next/link";
import Image from "next/image";

export default function RestaurantManagementPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id as string;

  const { data: restaurant, refetch: refetchRestaurant } = api.restaurant.getById.useQuery(
    { id: restaurantId },
    { enabled: !!restaurantId }
  );

  const createCategory = api.menu.createCategory.useMutation({
    onSuccess: () => {
      refetchRestaurant();
    },
  });

  const createDish = api.menu.createDish.useMutation({
    onSuccess: () => {
      refetchRestaurant();
    },
  });

  const updateDish = api.menu.updateDish.useMutation({
    onSuccess: () => {
      refetchRestaurant();
    },
  });

  const deleteDish = api.menu.deleteDish.useMutation({
    onSuccess: () => {
      refetchRestaurant();
    },
  });

  const deleteCategory = api.menu.deleteCategory.useMutation({
    onSuccess: () => {
      refetchRestaurant();
    },
  });

  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isDishDialogOpen, setIsDishDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<any>(null);

  const [dishForm, setDishForm] = useState({
    name: "",
    description: "",
    image: "",
    spiceLevel: undefined as number | undefined,
    price: "",
    categoryIds: [] as string[],
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleCreateCategory = async () => {
    try {
      await createCategory.mutateAsync({
        restaurantId,
        name: newCategoryName,
      });
      setNewCategoryName("");
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateDish = async () => {
    try {
      await createDish.mutateAsync({
        restaurantId,
        ...dishForm,
        categoryIds: dishForm.categoryIds.length > 0 ? dishForm.categoryIds : undefined,
      });
      setDishForm({
        name: "",
        description: "",
        image: "",
        spiceLevel: undefined,
        price: "",
        categoryIds: [],
      });
      setImagePreview(null);
      setIsDishDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateDish = async () => {
    if (!editingDish) return;
    try {
      await updateDish.mutateAsync({
        id: editingDish.id,
        ...dishForm,
        categoryIds: dishForm.categoryIds.length > 0 ? dishForm.categoryIds : undefined,
      });
      setEditingDish(null);
      setDishForm({
        name: "",
        description: "",
        image: "",
        spiceLevel: undefined,
        price: "",
        categoryIds: [],
      });
      setImagePreview(null);
      setIsDishDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteDish = async (dishId: string) => {
    if (!confirm("Are you sure you want to delete this dish?")) return;
    try {
      await deleteDish.mutateAsync({ id: dishId });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category? All dishes in this category will be removed from it.")) return;
    try {
      await deleteCategory.mutateAsync({ id: categoryId });
    } catch (error) {
      console.error(error);
    }
  };

  const openEditDishDialog = (dish: any) => {
    setEditingDish(dish);
    setDishForm({
      name: dish.name,
      description: dish.description ?? "",
      image: dish.image ?? "",
      spiceLevel: dish.spiceLevel ?? undefined,
      price: dish.price ?? "",
      categoryIds: dish.categories.map((c: any) => c.categoryId || c.id),
    });
    setImagePreview(dish.image ?? null);
    setIsDishDialogOpen(true);
  };

  const openCreateDishDialog = () => {
    setEditingDish(null);
    setDishForm({
      name: "",
      description: "",
      image: "",
      spiceLevel: undefined,
      price: "",
      categoryIds: [],
    });
    setImagePreview(null);
    setIsDishDialogOpen(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setDishForm({ ...dishForm, image: base64String });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!restaurant) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">← Back</Button>
            </Link>
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
          </div>
          <Link href={`/menu/${restaurantId}`} target="_blank">
            <Button variant="outline">View Public Menu</Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="dishes">All Dishes</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Create Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                      Add a new category for organizing dishes
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryName">Category Name</Label>
                      <Input
                        id="categoryName"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g., Starters, Main Course"
                      />
                    </div>
                    <Button
                      onClick={handleCreateCategory}
                      disabled={createCategory.isPending}
                      className="w-full"
                    >
                      {createCategory.isPending ? "Creating..." : "Create Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restaurant.categories.map((category) => {
                const categoryDishes = restaurant.dishes.filter((dish) =>
                  dish.categories.some((dc: any) => dc.categoryId === category.id || dc.category?.id === category.id)
                );
                return (
                  <Card key={category.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{category.name}</CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          ×
                        </Button>
                      </div>
                      <CardDescription>{categoryDishes.length} dishes</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {categoryDishes.map((dish) => (
                          <div key={dish.id} className="flex items-center justify-between border-b pb-2">
                            <span className="text-sm">{dish.name}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDishDialog(dish)}
                            >
                              Edit
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="dishes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Dishes</h2>
              <Button onClick={openCreateDishDialog}>Create Dish</Button>
            </div>

            <Dialog open={isDishDialogOpen} onOpenChange={setIsDishDialogOpen}>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingDish ? "Edit Dish" : "Create New Dish"}</DialogTitle>
                  <DialogDescription>
                    {editingDish ? "Update dish information" : "Add a new dish to the menu"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dishName">Dish Name</Label>
                    <Input
                      id="dishName"
                      value={dishForm.name}
                      onChange={(e) => setDishForm({ ...dishForm, name: e.target.value })}
                      placeholder="e.g., Aloo Tikki"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dishDescription">Description</Label>
                    <Textarea
                      id="dishDescription"
                      value={dishForm.description}
                      onChange={(e) => setDishForm({ ...dishForm, description: e.target.value })}
                      placeholder="Describe the dish..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dishImage">Dish Image</Label>
                    <Input
                      id="dishImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-500">Or enter image URL:</p>
                    <Input
                      id="dishImageUrl"
                      value={dishForm.image && !dishForm.image.startsWith("data:") ? dishForm.image : ""}
                      onChange={(e) => {
                        const url = e.target.value;
                        setDishForm({ ...dishForm, image: url });
                        if (url) {
                          setImagePreview(url);
                        } else {
                          setImagePreview(null);
                        }
                        // Clear file input when URL is entered
                        const fileInput = document.getElementById("dishImage") as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      placeholder="https://example.com/image.jpg"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <div className="flex items-center gap-4">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setImagePreview(null);
                              setDishForm({ ...dishForm, image: "" });
                              // Reset file input
                              const fileInput = document.getElementById("dishImage") as HTMLInputElement;
                              if (fileInput) fileInput.value = "";
                            }}
                          >
                            Remove Image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dishPrice">Price</Label>
                    <Input
                      id="dishPrice"
                      value={dishForm.price}
                      onChange={(e) => setDishForm({ ...dishForm, price: e.target.value })}
                      placeholder="₹ 90"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dishSpiceLevel">Spice Level (0-5, optional)</Label>
                    <Select
                      value={dishForm.spiceLevel?.toString() ?? undefined}
                      onValueChange={(value) =>
                        setDishForm({ ...dishForm, spiceLevel: value === "none" ? undefined : parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select spice level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {[0, 1, 2, 3, 4, 5].map((level) => (
                          <SelectItem key={level} value={level.toString()}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Categories (select multiple)</Label>
                    <div className="space-y-2">
                      {restaurant.categories.map((category) => (
                        <label key={category.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={dishForm.categoryIds.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setDishForm({
                                  ...dishForm,
                                  categoryIds: [...dishForm.categoryIds, category.id],
                                });
                              } else {
                                setDishForm({
                                  ...dishForm,
                                  categoryIds: dishForm.categoryIds.filter((id) => id !== category.id),
                                });
                              }
                            }}
                          />
                          <span>{category.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button
                    onClick={editingDish ? handleUpdateDish : handleCreateDish}
                    disabled={createDish.isPending || updateDish.isPending}
                    className="w-full"
                  >
                    {editingDish
                      ? updateDish.isPending
                        ? "Updating..."
                        : "Update Dish"
                      : createDish.isPending
                        ? "Creating..."
                        : "Create Dish"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="space-y-6">
              {restaurant.dishes.map((dish) => (
                <Card key={dish.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          {/* Dietary indicator - simplified for now */}
                          <span className="h-3 w-3 rounded-full bg-green-500"></span>
                          {dish.spiceLevel !== null && dish.spiceLevel !== undefined && (
                            Array.from({ length: dish.spiceLevel }).map((_, i) => (
                              <span key={i} className="text-red-500">
                                🌶️
                              </span>
                            ))
                          )}
                        </div>
                        <CardTitle className="mb-1 text-lg">{dish.name}</CardTitle>
                        {dish.price && (
                          <p className="mb-2 text-lg font-semibold text-gray-900">{dish.price}</p>
                        )}
                        {dish.description && (
                          <p className="mb-2 text-sm text-gray-600 line-clamp-3">
                            {dish.description}
                          </p>
                        )}
                        <div className="mb-2">
                          <p className="text-xs text-gray-500">Categories:</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {dish.categories.map((dc: any) => {
                              const category = dc.category || restaurant.categories.find((c) => c.id === dc.categoryId);
                              return category ? (
                                <span key={dc.id || category.id} className="rounded bg-gray-100 px-2 py-1 text-xs">
                                  {category.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDishDialog(dish)}
                            className="flex-1"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDish(dish.id)}
                            className="flex-1"
                          >
                            Delete
                          </Button>
                        </div>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

