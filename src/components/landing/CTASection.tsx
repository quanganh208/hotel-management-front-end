import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInUp, fadeIn, AnimatedSection } from "./AnimationComponents";

export default function CTASection() {
  return (
    <AnimatedSection>
      <section className="bg-primary text-primary-foreground py-16" id="cta">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <motion.div className="space-y-4" variants={fadeInUp}>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Sẵn sàng nâng cấp trải nghiệm quản lý khách sạn của bạn?
              </h2>
              <p className="text-primary-foreground/80 text-lg">
                Đăng ký dùng thử miễn phí 14 ngày và khám phá cách HotelManager
                Pro có thể giúp khách sạn của bạn vận hành hiệu quả hơn.
              </p>
            </motion.div>
            <motion.div
              className="bg-primary-foreground/10 p-6 rounded-lg"
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <form className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                      Họ và tên
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="name"
                      className="w-full px-3 py-2 rounded-md border border-primary-foreground/20 bg-transparent placeholder:text-primary-foreground/50"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      id="email"
                      type="email"
                      className="w-full px-3 py-2 rounded-md border border-primary-foreground/20 bg-transparent placeholder:text-primary-foreground/50"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="hotel" className="text-sm font-medium">
                    Tên khách sạn
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="hotel"
                    className="w-full px-3 py-2 rounded-md border border-primary-foreground/20 bg-transparent placeholder:text-primary-foreground/50"
                    placeholder="Nhập tên khách sạn"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Số điện thoại
                  </label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    id="phone"
                    className="w-full px-3 py-2 rounded-md border border-primary-foreground/20 bg-transparent placeholder:text-primary-foreground/50"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    Đăng ký dùng thử miễn phí
                  </Button>
                </motion.div>
                <p className="text-xs text-center text-primary-foreground/70">
                  Bằng cách đăng ký, bạn đồng ý với các điều khoản và chính sách
                  bảo mật của chúng tôi.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
