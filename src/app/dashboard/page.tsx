"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("auth-token");
    if (!storedToken) {
      router.push("/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  const { data: user } = api.auth.me.useQuery(
    { token: token ?? undefined },
    { enabled: !!token }
  );

  const { data: restaurants, refetch: refetchRestaurants } = api.restaurant.getAll.useQuery(
    undefined,
    { enabled: !!token }
  );

  const createRestaurant = api.restaurant.create.useMutation({
    onSuccess: () => {
      void refetchRestaurants();
    },
  });

  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantLocation, setNewRestaurantLocation] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateRestaurant = async () => {
    try {
      await createRestaurant.mutateAsync({
        name: newRestaurantName,
        location: newRestaurantLocation,
      });
      setNewRestaurantName("");
      setNewRestaurantLocation("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    router.push("/login");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-bold">My Restaurants</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Restaurant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Restaurant</DialogTitle>
                <DialogDescription>
                  Add a new restaurant to manage its menu
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Restaurant Name</Label>
                  <Input
                    id="name"
                    value={newRestaurantName}
                    onChange={(e) => setNewRestaurantName(e.target.value)}
                    placeholder="Super Restaurant"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newRestaurantLocation}
                    onChange={(e) => setNewRestaurantLocation(e.target.value)}
                    placeholder="Mumbai"
                  />
                </div>
                <Button
                  onClick={handleCreateRestaurant}
                  disabled={createRestaurant.isPending}
                  className="w-full"
                >
                  {createRestaurant.isPending ? "Creating..." : "Create Restaurant"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restaurants?.map((restaurant) => (
            <Card key={restaurant.id}>
              <CardHeader>
                <CardTitle>{restaurant.name}</CardTitle>
                <CardDescription>{restaurant.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/restaurant/${restaurant.id}`}>
                  <Button className="w-full">Manage Menu</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {restaurants?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No restaurants yet. Create your first restaurant!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

