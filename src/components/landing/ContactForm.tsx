import { motion } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fadeIn } from "./AnimationComponents";

export default function ContactForm() {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Gửi tin nhắn cho chúng tôi</CardTitle>
          <CardDescription>
            Điền thông tin của bạn và chúng tôi sẽ liên hệ lại trong vòng 24
            giờ.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="contact-name" className="text-sm font-medium">
                  Họ và tên
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="contact-name"
                  className="w-full px-3 py-2 rounded-md border"
                  placeholder="Nhập họ và tên"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="contact-email" className="text-sm font-medium">
                  Email
                </label>
                <motion.input
                  whileFocus={{ scale: 1.02 }}
                  id="contact-email"
                  type="email"
                  className="w-full px-3 py-2 rounded-md border"
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-subject" className="text-sm font-medium">
                Tiêu đề
              </label>
              <motion.input
                whileFocus={{ scale: 1.02 }}
                id="contact-subject"
                className="w-full px-3 py-2 rounded-md border"
                placeholder="Nhập tiêu đề"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="contact-message" className="text-sm font-medium">
                Nội dung
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.02 }}
                id="contact-message"
                className="w-full px-3 py-2 rounded-md border min-h-[120px]"
                placeholder="Nhập nội dung tin nhắn"
              />
            </div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button className="w-full">Gửi tin nhắn</Button>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
