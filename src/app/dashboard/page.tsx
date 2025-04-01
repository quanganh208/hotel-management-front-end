"use client";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Khách sạn</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Thêm khách sạn
          </Button>
        </motion.div>
      </div>
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6"
      >
        {hotels.map((hotel) => (
          <motion.div
            key={hotel.id}
            variants={item}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={`/hotels/${hotel.id}`}>
              <Card className="overflow-hidden cursor-pointer transition-colors hover:bg-muted/50 py-0">
                <CardHeader className="p-0">
                  <div className="h-48 w-full overflow-hidden">
                    <img
                      src={hotel.image || "/placeholder.svg"}
                      alt={hotel.name}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-3">
                  <CardTitle className="line-clamp-1 text-xl">
                    {hotel.name}
                  </CardTitle>
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {hotel.location}
                  </div>
                </CardContent>
                <CardFooter className="border-t bg-muted/50 p-3">
                  <Button variant="outline" className="w-full">
                    Xem chi tiết
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </DashboardShell>
  );
}

const hotels = [
  {
    id: "1",
    name: "Sunrise Beach Resort & Spa",
    location: "Đà Nẵng, Việt Nam",
    image:
      "https://cf.bstatic.com/xdata/images/hotel/max1024x768/505916043.jpg?k=ca8aa03c11264fef230bcc326df5d87cca81813944e3ef876c22c2596a51862b&o=&hp=1",
  },
  {
    id: "2",
    name: "Golden Dragon Hotel",
    location: "Hồ Chí Minh, Việt Nam",
    image:
      "https://media.istockphoto.com/id/119926339/photo/resort-swimming-pool.jpg?s=612x612&w=0&k=20&c=9QtwJC2boq3GFHaeDsKytF4-CavYKQuy1jBD2IRfYKc=",
  },
  {
    id: "3",
    name: "Emerald Bay Luxury Hotel",
    location: "Phú Quốc, Việt Nam",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "4",
    name: "Imperial Palace Hotel",
    location: "Hà Nội, Việt Nam",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "5",
    name: "Lotus Grand Hotel & Spa",
    location: "Nha Trang, Việt Nam",
    image: "/placeholder.svg?height=200&width=400",
  },
  {
    id: "6",
    name: "Riverside Boutique Hotel",
    location: "Hội An, Việt Nam",
    image: "/placeholder.svg?height=200&width=400",
  },
];
