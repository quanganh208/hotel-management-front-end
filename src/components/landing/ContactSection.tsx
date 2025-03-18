import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, AnimatedSection } from "./AnimationComponents";
import ContactInfo from "./ContactInfo";
import ContactForm from "./ContactForm";

export default function ContactSection() {
  return (
    <AnimatedSection>
      <section id="contact" className="bg-muted/30 border-y py-24">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            <motion.div className="space-y-6" variants={fadeInUp}>
              <Badge>Liên hệ</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Liên hệ với chúng tôi
              </h2>
              <p className="text-lg text-muted-foreground">
                Có câu hỏi hoặc cần tư vấn? Đội ngũ chuyên gia của chúng tôi
                luôn sẵn sàng hỗ trợ bạn.
              </p>
              <ContactInfo />
            </motion.div>
            <ContactForm />
          </div>
        </div>
      </section>
    </AnimatedSection>
  );
}
