"use client";

import * as React from "react";
import {
  BarChart2,
  Bed,
  DollarSign,
  FileText,
  Home,
  Package,
  Users,
  MessageSquareText,
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
  navMain: [
    {
      title: "Tổng quan",
      url: "/hotels/[id]/overview",
      icon: Home,
    },
    {
      title: "Phòng",
      url: "/hotels/[id]/rooms",
      icon: Bed,
      items: [
        {
          title: "Hạng phòng",
          url: "/hotels/[id]/rooms/categories",
        },
        {
          title: "Danh sách phòng",
          url: "/hotels/[id]/rooms/list",
        },
      ],
    },
    {
      title: "Giao dịch",
      url: "/hotels/[id]/transactions",
      icon: FileText,
      items: [
        {
          title: "Đặt phòng",
          url: "/hotels/[id]/transactions/bookings",
        },
        {
          title: "Hoá đơn",
          url: "/hotels/[id]/transactions/invoices",
        },
        {
          title: "Nhập hàng",
          url: "/hotels/[id]/transactions/purchases",
        },
      ],
    },
    {
      title: "Hàng hoá",
      url: "/hotels/[id]/inventory",
      icon: Package,
      items: [
        {
          title: "Danh mục",
          url: "/hotels/[id]/inventory/categories",
        },
        {
          title: "Kiểm kho",
          url: "/hotels/[id]/inventory/stock",
        },
      ],
    },
    {
      title: "Sổ quỹ",
      url: "/hotels/[id]/finance",
      icon: DollarSign,
    },
    {
      title: "Nhân viên",
      url: "/hotels/[id]/staff",
      icon: Users,
    },
    {
      title: "Báo cáo",
      url: "/hotels/[id]/reports",
      icon: BarChart2,
      items: [
        {
          title: "Cuối ngày",
          url: "/hotels/[id]/reports/daily",
        },
        {
          title: "Doanh thu",
          url: "/hotels/[id]/reports/revenue",
        },
      ],
    },
    {
      title: "Chatbot AI",
      url: "/hotels/[id]/chatbot",
      icon: MessageSquareText,
      items: [
        {
          title: "Thử nghiệm",
          url: "/hotels/[id]/chatbot/playground",
        },
        {
          title: "Lịch sử đoạn chat",
          url: "/hotels/[id]/chatbot/history",
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
        <HotelSwitcher />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
