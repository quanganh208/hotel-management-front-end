import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Building2, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";

export default function Header() {
  const [open, setOpen] = useState(false);

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
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild variant="outline">
              <Link href="/auth/login">Đăng nhập</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button asChild>
              <Link href="/auth/register">Dùng thử miễn phí</Link>
            </Button>
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
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
                  <SheetClose asChild>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setOpen(false)}
                    >
                      Đăng nhập
                    </Button>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button className="w-full" onClick={() => setOpen(false)}>
                      Dùng thử miễn phí
                    </Button>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
