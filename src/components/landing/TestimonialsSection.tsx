import { motion } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users } from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  AnimatedSection,
} from "./AnimationComponents";

export default function TestimonialsSection() {
  return (
    <AnimatedSection>
      <section className="bg-muted/30 border-y py-24">
        <div className="container">
          <motion.div
            className="text-center mb-16 max-w-3xl mx-auto"
            variants={fadeInUp}
          >
            <Badge className="mb-4">Khách hàng nói gì</Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Được tin dùng bởi các khách sạn hàng đầu
            </h2>
            <p className="text-lg text-muted-foreground">
              Khám phá cách HotelManager Pro đã giúp các khách sạn nâng cao hiệu
              quả hoạt động và tăng doanh thu.
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
                name: "Nguyễn Văn A",
                position: "Giám đốc khách sạn Luxury Palace",
                content:
                  "HotelManager Pro đã giúp chúng tôi tăng doanh thu 30% chỉ trong 6 tháng đầu sử dụng. Hệ thống quản lý đặt phòng tự động giúp tiết kiệm rất nhiều thời gian và nguồn lực.",
              },
              {
                name: "Trần Thị B",
                position: "Quản lý khách sạn Seaside Resort",
                content:
                  "Giao diện trực quan và dễ sử dụng. Nhân viên của chúng tôi chỉ mất vài giờ để làm quen với hệ thống. Đặc biệt ấn tượng với tính năng báo cáo phân tích chi tiết.",
              },
              {
                name: "Lê Văn C",
                position: "Chủ chuỗi khách sạn City Hotels",
                content:
                  "Sau khi triển khai HotelManager Pro, chúng tôi đã giảm 80% thời gian xử lý đặt phòng và check-in. Hỗ trợ kỹ thuật luôn sẵn sàng giải đáp mọi thắc mắc 24/7.",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
              >
                <Card className="relative h-full">
                  <CardHeader className="pb-0">
                    <motion.div
                      className="absolute -top-4 left-4"
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      viewport={{ once: true }}
                    >
                      <Star className="h-8 w-8 fill-primary text-primary" />
                    </motion.div>
                    <div className="pt-6">
                      <motion.div
                        className="flex gap-1"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        viewport={{ once: true }}
                      >
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.div
                            key={star}
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            transition={{ delay: 0.3 + star * 0.1 }}
                            viewport={{ once: true }}
                          >
                            <Star className="h-5 w-5 fill-primary text-primary" />
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <p className="mb-6 text-muted-foreground">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium">{testimonial.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.position}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatedSection>
  );
}
