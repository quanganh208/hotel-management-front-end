import Link from "next/link";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [avatarFallback, setAvatarFallback] = useState("");

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
    await signOut({ redirect: false });
  };

  const navItems = [
    { name: "Trang chủ", href: "#" },
    { name: "Tính năng", href: "#features" },
    { name: "Bảng giá", href: "#pricing" },
    { name: "Demo & Hỗ trợ", href: "#cta" },
    { name: "Liên hệ", href: "#contact" },
  ];

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
          <Link href="#" className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HotelManager Pro</span>
          </Link>
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-6">
          {navItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.5 }}
            >
              <Link
                href={item.href}
                className="text-sm font-medium hover:text-primary"
              >
                {item.name}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-24 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </>
          ) : session ? (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline">
                  <Link href="/dashboard">Trang chủ</Link>
                </Button>
              </motion.div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          session.user.image ||
                          `/api/avatar?name=${encodeURIComponent(session.user?.name || "User")}`
                        }
                        alt={session.user.name || "Người dùng"}
                      />
                      <AvatarFallback>{avatarFallback}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || "Người dùng"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Nâng cấp lên Pro
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      <BadgeCheck className="mr-2 h-4 w-4" />
                      Tài khoản
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Thanh toán
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Bell className="mr-2 h-4 w-4" />
                      Thông báo
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline">
                  <Link href="/auth/login">Đăng nhập</Link>
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild>
                  <Link href="/auth/register">Dùng thử miễn phí</Link>
                </Button>
              </motion.div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2">
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </>
          ) : (
            <>
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
                    <nav className="flex flex-col gap-4">
                      {navItems.map((item, i) => (
                        <SheetClose asChild key={i}>
                          <Link
                            href={item.href}
                            className="text-sm font-medium hover:text-primary"
                            onClick={() => setOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                    <div className="flex flex-col gap-4 mt-4">
                      {session ? (
                        <>
                          <SheetClose asChild>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setOpen(false)}
                            >
                              <Link
                                href="/dashboard"
                                className="flex w-full items-center justify-center"
                              >
                                Trang chủ
                              </Link>
                            </Button>
                          </SheetClose>
                          <div className="flex items-center gap-3 px-1 py-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={
                                  session.user.image ||
                                  `/api/avatar?name=${encodeURIComponent(session.user?.name || "User")}`
                                }
                                alt={session.user.name || "Người dùng"}
                              />
                              <AvatarFallback>{avatarFallback}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {session.user.name || "Người dùng"}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {session.user.email}
                              </span>
                            </div>
                          </div>
                          <SheetClose asChild>
                            <Button
                              variant="outline"
                              className="w-full flex items-center justify-start gap-2"
                              onClick={() => setOpen(false)}
                            >
                              <Sparkles className="h-4 w-4" />
                              <span>Nâng cấp lên Pro</span>
                            </Button>
                          </SheetClose>
                          <div className="flex flex-col gap-2">
                            <SheetClose asChild>
                              <Button
                                variant="outline"
                                className="w-full flex items-center justify-start gap-2"
                                onClick={() => setOpen(false)}
                              >
                                <BadgeCheck className="h-4 w-4" />
                                <span>Tài khoản</span>
                              </Button>
                            </SheetClose>
                            <SheetClose asChild>
                              <Button
                                variant="outline"
                                className="w-full flex items-center justify-start gap-2"
                                onClick={() => setOpen(false)}
                              >
                                <CreditCard className="h-4 w-4" />
                                <span>Thanh toán</span>
                              </Button>
                            </SheetClose>
                            <SheetClose asChild>
                              <Button
                                variant="outline"
                                className="w-full flex items-center justify-start gap-2"
                                onClick={() => setOpen(false)}
                              >
                                <Bell className="h-4 w-4" />
                                <span>Thông báo</span>
                              </Button>
                            </SheetClose>
                          </div>
                          <SheetClose asChild>
                            <Button
                              variant="secondary"
                              className="w-full flex items-center justify-start gap-2"
                              onClick={handleSignOut}
                            >
                              <LogOut className="h-4 w-4" />
                              <span>Đăng xuất</span>
                            </Button>
                          </SheetClose>
                        </>
                      ) : (
                        <>
                          <SheetClose asChild>
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => setOpen(false)}
                            >
                              <Link
                                href="/auth/login"
                                className="flex w-full items-center justify-center"
                              >
                                Đăng nhập
                              </Link>
                            </Button>
                          </SheetClose>
                          <SheetClose asChild>
                            <Button
                              className="w-full"
                              onClick={() => setOpen(false)}
                            >
                              <Link
                                href="/auth/register"
                                className="flex w-full items-center justify-center"
                              >
                                Dùng thử miễn phí
                              </Link>
                            </Button>
                          </SheetClose>
                        </>
                      )}
                    </div>
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
