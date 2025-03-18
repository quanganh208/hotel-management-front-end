import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  fadeInUp,
  staggerContainer,
  AnimatedSection,
} from "./AnimationComponents";

export default function FAQSection() {
  return (
    <AnimatedSection>
      <section className="container py-24">
        <motion.div
          className="text-center mb-16 max-w-3xl mx-auto"
          variants={fadeInUp}
        >
          <Badge className="mb-4">Câu hỏi thường gặp</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Giải đáp thắc mắc của bạn
          </h2>
          <p className="text-lg text-muted-foreground">
            Tìm hiểu thêm về HotelManager Pro và cách nó có thể giúp khách sạn
            của bạn.
          </p>
        </motion.div>

        <motion.div
          className="max-w-3xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {[
            {
              question:
                "HotelManager Pro có phù hợp với khách sạn quy mô nhỏ không?",
              answer:
                "Có, chúng tôi cung cấp gói Cơ bản dành riêng cho khách sạn nhỏ dưới 20 phòng với đầy đủ các tính năng thiết yếu để vận hành hiệu quả.",
            },
            {
              question:
                "Tôi có thể dùng thử HotelManager Pro trước khi mua không?",
              answer:
                "Có, chúng tôi cung cấp bản dùng thử miễn phí 14 ngày với đầy đủ tính năng để bạn có thể trải nghiệm và đánh giá sự phù hợp với nhu cầu của khách sạn.",
            },
            {
              question:
                "HotelManager Pro có thể tích hợp với các nền tảng đặt phòng trực tuyến không?",
              answer:
                "Có, HotelManager Pro tích hợp liền mạch với các OTA phổ biến như Booking.com, Agoda, Expedia và nhiều nền tảng khác, giúp đồng bộ hóa tình trạng phòng và đặt phòng tự động.",
            },
            {
              question: "Tôi cần cài đặt phần mềm như thế nào?",
              answer:
                "HotelManager Pro là giải pháp dựa trên đám mây, không cần cài đặt phức tạp. Bạn chỉ cần đăng ký tài khoản và có thể truy cập từ bất kỳ thiết bị nào có kết nối internet.",
            },
            {
              question: "Dữ liệu của tôi có được bảo mật không?",
              answer:
                "Chúng tôi áp dụng các biện pháp bảo mật cao cấp với mã hóa SSL 256-bit và tuân thủ các quy định về bảo vệ dữ liệu. Dữ liệu của bạn được sao lưu thường xuyên và được bảo vệ an toàn.",
            },
            {
              question: "Tôi có thể nhận được hỗ trợ kỹ thuật như thế nào?",
              answer:
                "Chúng tôi cung cấp hỗ trợ kỹ thuật qua email cho tất cả các gói, và hỗ trợ 24/7 qua điện thoại cho các gói Chuyên nghiệp và Doanh nghiệp. Ngoài ra, chúng tôi còn có trung tâm trợ giúp trực tuyến với hướng dẫn chi tiết.",
            },
          ].map((faq, index) => (
            <motion.div
              key={index}
              className="border-b py-4"
              variants={fadeInUp}
              custom={index}
            >
              <details className="group">
                <motion.summary
                  className="flex cursor-pointer items-center justify-between py-2 font-medium"
                  whileHover={{ x: 5 }}
                >
                  {faq.question}
                  <svg
                    className="h-5 w-5 transition-transform group-open:rotate-180"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.summary>
                <motion.div
                  className="mt-2 text-muted-foreground"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              </details>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </AnimatedSection>
  );
}
