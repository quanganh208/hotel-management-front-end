import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard } from "lucide-react";
import {
  fadeInUp,
  fadeIn,
  AnimatedSection,
  AnimatedTabContent,
  AnimatedListItem,
} from "./AnimationComponents";
import Link from "next/link";

export default function DemoSection() {
  return (
    <AnimatedSection>
      <section id="demo-&-hỗ-trợ" className="container py-24">
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          <Badge className="mb-4">Xem trước</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Trải nghiệm HotelManager Pro
          </h2>
          <p className="text-lg text-muted-foreground">
            Khám phá giao diện trực quan và các tính năng mạnh mẽ của hệ thống
            quản lý khách sạn hàng đầu.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <motion.div
            className="relative aspect-video rounded-lg overflow-hidden shadow-xl border"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src="/landing/dashboard_preview.png"
              alt="Demo Video"
              fill
              className="object-cover"
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              viewport={{ once: true }}
            >
              <motion.div
                className="h-16 w-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer hover:bg-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8 text-white ml-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
            </motion.div>
          </motion.div>
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                <TabsTrigger value="booking">Đặt phòng</TabsTrigger>
                <TabsTrigger value="reports">Báo cáo</TabsTrigger>
              </TabsList>
              <AnimatedTabContent
                value="dashboard"
                title="Bảng điều khiển trực quan"
              >
                <p className="text-muted-foreground">
                  Theo dõi tất cả hoạt động của khách sạn trong một giao diện
                  duy nhất. Xem nhanh tình trạng phòng, lịch đặt phòng và các
                  chỉ số hiệu suất quan trọng.
                </p>
                <ul className="space-y-2 mt-4">
                  <AnimatedListItem>
                    Tổng quan trực quan về tình trạng phòng
                  </AnimatedListItem>
                  <AnimatedListItem>
                    Thông báo check-in/check-out trong ngày
                  </AnimatedListItem>
                  <AnimatedListItem>
                    Biểu đồ doanh thu và công suất phòng
                  </AnimatedListItem>
                </ul>
              </AnimatedTabContent>
              <AnimatedTabContent
                value="booking"
                title="Quản lý đặt phòng thông minh"
              >
                <p className="text-muted-foreground">
                  Hệ thống đặt phòng trực tuyến tự động với lịch đặt phòng trực
                  quan. Quản lý dễ dàng các yêu cầu đặc biệt và thay đổi lịch
                  trình.
                </p>
                <ul className="space-y-2 mt-4">
                  <AnimatedListItem>
                    Giao diện lịch đặt phòng kéo thả
                  </AnimatedListItem>
                  <AnimatedListItem>
                    Tự động kiểm tra tình trạng phòng trống
                  </AnimatedListItem>
                  <AnimatedListItem>
                    Xác nhận đặt phòng tự động qua email/SMS
                  </AnimatedListItem>
                </ul>
              </AnimatedTabContent>
              <AnimatedTabContent
                value="reports"
                title="Báo cáo phân tích chi tiết"
              >
                <p className="text-muted-foreground">
                  Truy cập báo cáo chi tiết về doanh thu, công suất phòng và các
                  chỉ số hiệu suất quan trọng. Xuất báo cáo dưới nhiều định
                  dạng.
                </p>
                <ul className="space-y-2 mt-4">
                  <AnimatedListItem>
                    Biểu đồ phân tích xu hướng theo thời gian
                  </AnimatedListItem>
                  <AnimatedListItem>
                    Báo cáo doanh thu theo nguồn đặt phòng
                  </AnimatedListItem>
                  <AnimatedListItem>
                    Phân tích chi tiết về phản hồi của khách hàng
                  </AnimatedListItem>
                </ul>
              </AnimatedTabContent>
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button size="lg" className="gap-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <Link href="/auth/register">Dùng thử miễn phí 14 ngày</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </AnimatedSection>
  );
}
