"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  Building2,
  CreditCard,
  LogOut,
  Menu,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const [avatarFallback, setAvatarFallback] = useState("");
  const isLoading = status === "loading";

  useEffect(() => {
    if (session?.user?.name) {
      // Tạo chữ cái đầu của tên và họ người dùng
      const initials = session.user.name
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
      setAvatarFallback(initials);
    } else {
      setAvatarFallback("ND");
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href="/dashboard" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HotelManager Pro</span>
          </Link>
        </motion.div>

        {/* Desktop Buttons */}
        {isLoading ? (
          <div className="hidden lg:flex items-center gap-4">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ) : session ? (
          <div className="hidden lg:flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        session.user?.image ||
                        `/api/avatar?name=${encodeURIComponent(session.user?.name || "User")}`
                      }
                      alt={session.user?.name || "Người dùng"}
                    />
                    <AvatarFallback>{avatarFallback}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user?.name || "Người dùng"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Sparkles />
                    Nâng cấp lên Pro
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BadgeCheck />
                    Tài khoản
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard />
                    Thanh toán
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell />
                    Thông báo
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </>
          ) : (
            <>
              <ThemeToggle />
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Mở menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 p-6">
                  <SheetTitle>Menu</SheetTitle>

                  <div className="flex flex-col gap-6">
                    {session && (
                      <div className="flex flex-col gap-4 mt-4">
                        <div className="flex items-center gap-3 px-1 py-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={
                                session.user?.image ||
                                `/api/avatar?name=${encodeURIComponent(session.user?.name || "User")}`
                              }
                              alt={session.user?.name || "Người dùng"}
                            />
                            <AvatarFallback>{avatarFallback}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {session.user?.name || "Người dùng"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {session.user?.email}
                            </span>
                          </div>
                        </div>
                        <SheetClose asChild>
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => setOpen(false)}
                          >
                            <Link
                              href="#"
                              className="flex w-full items-center justify-center"
                            >
                              Tài khoản
                            </Link>
                          </Button>
                        </SheetClose>
                        <SheetClose asChild>
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={handleSignOut}
                          >
                            Đăng xuất
                          </Button>
                        </SheetClose>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
