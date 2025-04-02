"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const params = useParams();
  const pathname = usePathname();
  const hotelId = params.id as string;

  const [openItems, setOpenItems] = useState<Record<string, boolean>>(
    Object.fromEntries(
      items
        .filter((item) => item.isActive && item.items && item.items.length > 0)
        .map((item) => [item.title, true]),
    ),
  );

  const handleOpenChange = (title: string, open: boolean) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: open,
    }));
  };

  const replaceIdInUrl = (url: string) => {
    return url.replace("[id]", hotelId);
  };

  const isRouteActive = (url: string) => {
    const fullUrl = replaceIdInUrl(url);
    return pathname.startsWith(fullUrl);
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          if (!item.items || item.items.length === 0) {
            const isActive = isRouteActive(item.url);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  className={`py-2 ${isActive ? "bg-primary/20 text-primary dark:bg-sidebar-accent" : ""}`}
                  isActive={isActive}
                >
                  <Link href={replaceIdInUrl(item.url)}>
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          const isOpen = openItems[item.title] || false;
          const isActive = isRouteActive(item.url);

          return (
            <SidebarMenuItem key={item.title} className="py-1">
              <div className="group/collapsible">
                <SidebarMenuButton
                  tooltip={item.title}
                  className={`py-2 w-full ${isActive ? "bg-primary/20 text-primary dark:bg-sidebar-accent" : ""}`}
                  onClick={() => handleOpenChange(item.title, !isOpen)}
                  isActive={isActive}
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.title}</span>
                  <ChevronRight
                    className={`ml-auto transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`}
                  />
                </SidebarMenuButton>
                <div className="overflow-hidden">
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key={`submenu-${item.title}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.3,
                          ease: [0.04, 0.62, 0.23, 0.98],
                        }}
                      >
                        <SidebarMenuSub className="space-y-1 py-1">
                          {item.items?.map((subItem) => {
                            const isSubItemActive = isRouteActive(subItem.url);
                            return (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  className={`py-1.5 ${isSubItemActive ? "bg-primary/20 text-primary dark:bg-sidebar-accent" : ""}`}
                                  isActive={isSubItemActive}
                                >
                                  <Link href={replaceIdInUrl(subItem.url)}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
