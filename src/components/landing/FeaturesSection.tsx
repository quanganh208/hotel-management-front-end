import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  BarChartIcon as ChartBarIcon,
  Users,
  CreditCard,
  Globe,
  Smartphone,
} from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  AnimatedSection,
} from "./AnimationComponents";

export default function FeaturesSection() {
  return (
    <AnimatedSection>
      <section id="features" className="container py-24">
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          <Badge className="mb-4">Tính năng nổi bật</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Giải pháp quản lý toàn diện cho khách sạn của bạn
          </h2>
          <p className="text-lg text-muted-foreground">
            HotelManager Pro cung cấp đầy đủ các công cụ cần thiết để vận hành
            khách sạn hiệu quả, từ quản lý đặt phòng đến báo cáo phân tích chi
            tiết.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {[
            {
              icon: <Calendar className="h-10 w-10 text-primary" />,
              title: "Quản lý đặt phòng",
              description:
                "Hệ thống đặt phòng trực tuyến tự động, quản lý check-in/out và lịch trình phòng trực quan.",
            },
            {
              icon: <Users className="h-10 w-10 text-primary" />,
              title: "Quản lý khách hàng",
              description:
                "Lưu trữ thông tin khách hàng, lịch sử lưu trú và tùy chỉnh trải nghiệm cá nhân hóa.",
            },
            {
              icon: <ChartBarIcon className="h-10 w-10 text-primary" />,
              title: "Báo cáo & Phân tích",
              description:
                "Báo cáo chi tiết về doanh thu, công suất phòng và các chỉ số hiệu suất quan trọng.",
            },
            {
              icon: <CreditCard className="h-10 w-10 text-primary" />,
              title: "Thanh toán tích hợp",
              description:
                "Xử lý thanh toán an toàn với nhiều phương thức và tự động hóa hóa đơn.",
            },
            {
              icon: <Globe className="h-10 w-10 text-primary" />,
              title: "Tích hợp đa nền tảng",
              description:
                "Kết nối với các OTA, kênh phân phối và hệ thống PMS khác một cách liền mạch.",
            },
            {
              icon: <Smartphone className="h-10 w-10 text-primary" />,
              title: "Ứng dụng di động",
              description:
                "Quản lý khách sạn mọi lúc, mọi nơi với ứng dụng di động đầy đủ tính năng.",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -10, transition: { duration: 0.2 } }}
            >
              <Card className="border-none shadow-md hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <motion.div
                    className="p-2 w-fit rounded-lg bg-primary/10 mb-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    {feature.icon}
                  </motion.div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </AnimatedSection>
  );
}
