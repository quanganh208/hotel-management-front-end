import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle2 } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.5 }}
      >
        <Image
          src="/placeholder.svg?height=800&width=1920"
          alt="Hotel Management Software"
          fill
          className="object-cover"
          priority
        />
      </motion.div>
      <div className="container relative z-10 py-24 md:py-32">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="px-3 py-1 text-sm">
                Phần mềm quản lý khách sạn #1
              </Badge>
            </motion.div>
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Quản Lý Khách Sạn Chưa Bao Giờ Dễ Dàng Đến Thế
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Tự động hóa quy trình, tăng hiệu quả hoạt động và tối ưu trải
              nghiệm khách hàng với giải pháp quản lý khách sạn toàn diện.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  Xem Demo Ngay
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button size="lg" variant="outline" className="gap-2">
                  Dùng Thử Miễn Phí
                </Button>
              </motion.div>
            </motion.div>
            <motion.div
              className="flex items-center gap-4 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {[
                {
                  icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
                  text: "Cài đặt dễ dàng",
                },
                {
                  icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
                  text: "Hỗ trợ 24/7",
                },
                {
                  icon: <CheckCircle2 className="h-4 w-4 text-primary" />,
                  text: "Cập nhật liên tục",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                >
                  {item.icon}
                  <span>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
          <motion.div
            className="relative h-[400px] rounded-lg overflow-hidden shadow-2xl border"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{
              y: -5,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <Image
              src="/placeholder.svg?height=800&width=1200"
              alt="Dashboard Preview"
              fill
              className="object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
