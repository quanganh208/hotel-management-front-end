"use client";

import * as React from "react";
import {
  BarChart2,
  Bed,
  Building,
  DollarSign,
  FileText,
  Home,
  Package,
  Users,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { HotelSwitcher } from "./hotel-switcher";
import { NavMain } from "./nav-main";
import { useIsMobile } from "@/hooks/use-mobile";

const data = {
  hotels: [
    {
      name: "Resort Phú Quốc",
      logo: Building,
      location: "Phú Quốc, Kiên Giang",
    },
    {
      name: "Palais De Jade",
      logo: Building,
      location: "Đà Nẵng",
    },
    {
      name: "Hilton Hà Nội",
      logo: Building,
      location: "Hà Nội",
    },
  ],
  navMain: [
    {
      title: "Tổng quan",
      url: "#",
      icon: Home,
    },
    {
      title: "Phòng",
      url: "#",
      icon: Bed,
      items: [
        {
          title: "Hạng phòng",
          url: "#",
        },
        {
          title: "Danh sách phòng",
          url: "#",
        },
      ],
    },
    {
      title: "Giao dịch",
      url: "#",
      icon: FileText,
      items: [
        {
          title: "Đặt phòng",
          url: "#",
        },
        {
          title: "Hoá đơn",
          url: "#",
        },
        {
          title: "Nhập hàng",
          url: "#",
        },
      ],
    },
    {
      title: "Hàng hoá",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Danh mục",
          url: "#",
        },
        {
          title: "Kiểm kho",
          url: "#",
        },
      ],
    },
    {
      title: "Sổ quỹ",
      url: "#",
      icon: DollarSign,
    },
    {
      title: "Nhân viên",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Danh sách nhân viên",
          url: "#",
        },
        {
          title: "Thiết lập nhân viên",
          url: "#",
        },
      ],
    },
    {
      title: "Báo cáo",
      url: "#",
      icon: BarChart2,
      items: [
        {
          title: "Cuối ngày",
          url: "#",
        },
        {
          title: "Doanh thu",
          url: "#",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className={isMobile ? "h-6" : "h-18"} />
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <HotelSwitcher hotels={data.hotels} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
