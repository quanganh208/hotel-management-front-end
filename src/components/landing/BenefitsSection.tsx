import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import {
  fadeInUp,
  fadeIn,
  staggerContainer,
  AnimatedSection,
} from "./AnimationComponents";

export default function BenefitsSection() {
  return (
    <AnimatedSection>
      <section className="bg-muted/30 border-y py-24">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <motion.div className="space-y-6" variants={fadeInUp}>
              <Badge>Lợi ích vượt trội</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Tại sao chọn HotelManager Pro?
              </h2>
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                {[
                  {
                    title: "Tiết kiệm thời gian",
                    description:
                      "Giảm 70% thời gian quản lý hành chính với quy trình tự động hóa.",
                  },
                  {
                    title: "Tăng doanh thu",
                    description:
                      "Khách sạn sử dụng HotelManager Pro ghi nhận tăng doanh thu trung bình 25%.",
                  },
                  {
                    title: "Giảm thiểu sai sót",
                    description:
                      "Hạn chế tối đa lỗi đặt phòng trùng và các sai sót trong vận hành.",
                  },
                  {
                    title: "Nâng cao trải nghiệm khách hàng",
                    description:
                      "Đáp ứng nhanh chóng và cá nhân hóa dịch vụ cho từng khách hàng.",
                  },
                ].map((benefit, index) => (
                  <motion.div
                    key={index}
                    className="flex gap-4"
                    variants={fadeInUp}
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <motion.div
                        className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center"
                        initial={{ scale: 0.5 }}
                        whileInView={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 10,
                          delay: index * 0.1,
                        }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="font-medium">{benefit.title}</h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div
              className="relative h-[500px] rounded-lg overflow-hidden shadow-xl border"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{
                y: -10,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <Image
                src="/placeholder.svg?height=1000&width=800"
                alt="Hotel Management Benefits"
                fill
                className="object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
