"use client";

import * as React from "react";
import { ChevronsUpDown, Home } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useHotelStore } from "@/store/hotels";
import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import { Hotel } from "@/types/hotel";

export function HotelSwitcher() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const hotelId = typeof params?.id === "string" ? params.id : null;
  const { hotels, isLoading } = useHotelStore();

  const [activeHotel, setActiveHotel] = useState<Hotel>();

  useEffect(() => {
    if (hotels.length > 0) {
      if (hotelId) {
        const foundHotel = hotels.find((hotel) => hotel._id === hotelId);
        if (foundHotel) {
          setActiveHotel(foundHotel);
          return;
        }
      }

      if (!activeHotel) {
        setActiveHotel(hotels[0]);
      }
    }
  }, [hotels, hotelId, activeHotel]);

  // Không hiển thị nếu không có hotels
  if (!activeHotel && hotels.length === 0) {
    return null;
  }

  const HotelLogo = () => (
    <div className="flex items-center justify-center">
      <span className="text-xs font-bold">
        {activeHotel?.name?.slice(0, 2)}
      </span>
    </div>
  );

  const handleSelectHotel = (hotel: Hotel) => {
    setActiveHotel(hotel);
    router.push(`/hotels/${hotel._id}`);
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground overflow-hidden">
                {activeHotel ? (
                  activeHotel.image ? (
                    <Image
                      src={activeHotel.image}
                      alt={activeHotel.name}
                      width={32}
                      height={32}
                      className="size-full object-cover"
                    />
                  ) : (
                    <HotelLogo />
                  )
                ) : null}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {activeHotel?.name || "Đang tải..."}
                </span>
                <span className="truncate text-xs">
                  {activeHotel?.address || ""}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Khách sạn
            </DropdownMenuLabel>
            {isLoading ? (
              <DropdownMenuItem disabled className="gap-2 p-2">
                Đang tải...
              </DropdownMenuItem>
            ) : (
              hotels.map((hotel) => (
                <DropdownMenuItem
                  key={hotel._id}
                  onClick={() => handleSelectHotel(hotel)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border overflow-hidden">
                    {hotel.image ? (
                      <Image
                        src={hotel.image}
                        alt={hotel.name}
                        width={24}
                        height={24}
                        className="size-full object-cover"
                      />
                    ) : (
                      <HotelLogo />
                    )}
                  </div>
                  {hotel.name}
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 p-2"
              onClick={() => router.push("/dashboard")}
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Home className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Quay lại trang chủ
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
