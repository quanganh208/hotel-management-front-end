import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import {
  fadeInUp,
  staggerContainer,
  AnimatedSection,
} from "./AnimationComponents";

export default function PricingSection() {
  return (
    <AnimatedSection>
      <section id="pricing" className="container py-24">
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          <Badge className="mb-4">Bảng giá</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn
          </h2>
          <p className="text-lg text-muted-foreground">
            Chúng tôi cung cấp nhiều gói dịch vụ linh hoạt để đáp ứng nhu cầu
            của mọi quy mô khách sạn.
          </p>
        </motion.div>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {[
            {
              name: "Cơ bản",
              price: "2.990.000",
              description: "Dành cho khách sạn nhỏ dưới 20 phòng",
              features: [
                "Quản lý đặt phòng cơ bản",
                "Báo cáo doanh thu hàng tháng",
                "Hỗ trợ email",
                "Cập nhật phần mềm",
                "1 người dùng quản trị",
              ],
              cta: "Bắt đầu dùng thử",
            },
            {
              name: "Chuyên nghiệp",
              price: "5.990.000",
              description: "Dành cho khách sạn vừa từ 20-50 phòng",
              features: [
                "Tất cả tính năng của gói Cơ bản",
                "Tích hợp với các OTA",
                "Báo cáo phân tích chi tiết",
                "Hỗ trợ 24/7 qua điện thoại",
                "5 người dùng quản trị",
                "Đào tạo trực tuyến",
              ],
              cta: "Gói phổ biến nhất",
              popular: true,
            },
            {
              name: "Doanh nghiệp",
              price: "Liên hệ",
              description: "Dành cho chuỗi khách sạn lớn",
              features: [
                "Tất cả tính năng của gói Chuyên nghiệp",
                "API tùy chỉnh",
                "Tích hợp với hệ thống hiện có",
                "Người quản trị không giới hạn",
                "Đào tạo tại chỗ",
                "Hỗ trợ kỹ thuật ưu tiên",
                "Tùy chỉnh theo yêu cầu",
              ],
              cta: "Liên hệ bộ phận kinh doanh",
            },
          ].map((plan, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -15, transition: { duration: 0.2 } }}
            >
              <Card
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg" : ""
                } h-full`}
              >
                {plan.popular && (
                  <motion.div
                    className="absolute -top-4 left-0 right-0 flex justify-center"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    viewport={{ once: true }}
                  >
                    <Badge className="bg-primary hover:bg-primary">
                      Phổ biến nhất
                    </Badge>
                  </motion.div>
                )}
                <CardHeader className={plan.popular ? "pt-8" : ""}>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <motion.div
                    className="mt-4"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.price !== "Liên hệ" && (
                      <span className="text-muted-foreground"> VNĐ/tháng</span>
                    )}
                  </motion.div>
                </CardHeader>
                <CardContent>
                  <motion.ul
                    className="space-y-3 mb-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {plan.features.map((feature, i) => (
                      <motion.li
                        key={i}
                        className="flex items-center gap-2"
                        variants={fadeInUp}
                        custom={i}
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          transition={{ delay: 0.2 + i * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        </motion.div>
                        <span>{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="w-full"
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </AnimatedSection>
  );
}
