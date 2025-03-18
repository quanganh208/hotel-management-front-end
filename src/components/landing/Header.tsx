import Link from "next/link";
import {motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {Building2} from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{y: -20, opacity: 0}}
      animate={{y: 0, opacity: 1}}
      transition={{duration: 0.5}}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{scale: 1.05}}
          transition={{type: "spring", stiffness: 400, damping: 10}}
        >
          <Building2 className="h-6 w-6 text-primary"/>
          <span className="text-xl font-bold">HotelManager Pro</span>
        </motion.div>
        <nav className="hidden md:flex gap-6">
          {[
            {name: "Trang chủ", href: "#"},
            {name: "Tính năng", href: "#features"},
            {name: "Bảng giá", href: "#pricing"},
            {name: "Demo & Hỗ trợ", href: "#cta"},
            {name: "Liên hệ", href: "#contact"},
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{opacity: 0, y: -10}}
              animate={{opacity: 1, y: 0}}
              transition={{delay: 0.1 * i, duration: 0.5}}
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
        <div className="flex items-center gap-4">
          <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
            <Button variant="outline" className="hidden md:flex">
              Đăng nhập
            </Button>
          </motion.div>
          <motion.div whileHover={{scale: 1.05}} whileTap={{scale: 0.95}}>
            <Button>Dùng thử miễn phí</Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
