"use client";
import Link from "next/link";
import { MapPin, Building } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CreateHotelDialog } from "@/components/hotels/create-hotel-dialog";
import { useHotelStore } from "@/store/hotels";
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
  const { hotels, isLoading, error, fetchHotels } = useHotelStore();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    fetchHotels();
    setInitialized(true);
  }, [fetchHotels]);

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Khách sạn</h1>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <CreateHotelDialog />
        </motion.div>
      </div>
      {isLoading || !initialized ? (
        <div className="flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[400px] text-destructive">
          {error}
        </div>
      ) : hotels.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
          <p className="text-lg">Chưa có khách sạn nào</p>
          <p className="text-sm mt-2">Hãy thêm khách sạn đầu tiên của bạn</p>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-6"
        >
          {hotels.map((hotel) => (
            <motion.div
              key={hotel._id}
              variants={item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={`/hotels/${hotel._id}`}>
                <Card className="overflow-hidden cursor-pointer transition-colors hover:bg-muted/50 py-0">
                  <CardHeader className="p-0">
                    <div className="h-48 w-full overflow-hidden">
                      {hotel.image ? (
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-100">
                          <Building className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <CardTitle className="line-clamp-1 text-xl">
                      {hotel.name}
                    </CardTitle>
                    <div className="mt-2 flex items-center text-sm text-muted-foreground">
                      <MapPin className="mr-1 h-4 w-4" />
                      {hotel.address}
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
      )}
    </DashboardShell>
  );
}
