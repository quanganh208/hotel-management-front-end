import { motion } from "framer-motion";
import { MessageSquare, Smartphone, Building2 } from "lucide-react";
import { fadeInUp, staggerContainer } from "./AnimationComponents";

export default function ContactInfo() {
  return (
    <motion.div
      className="space-y-4"
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {[
        {
          icon: <MessageSquare className="h-5 w-5 text-primary" />,
          title: "Email",
          content: "info@hotelmanagerpro.com",
        },
        {
          icon: <Smartphone className="h-5 w-5 text-primary" />,
          title: "Điện thoại",
          content: "+84 (0) 123 456 789",
        },
        {
          icon: <Building2 className="h-5 w-5 text-primary" />,
          title: "Văn phòng",
          content: "123 Đường ABC, Quận 1, TP. Hồ Chí Minh",
        },
      ].map((item, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-4"
          variants={fadeInUp}
          whileHover={{ x: 5 }}
        >
          <motion.div
            className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 10,
              delay: index * 0.1,
            }}
            viewport={{ once: true }}
          >
            {item.icon}
          </motion.div>
          <div>
            <h3 className="font-medium">{item.title}</h3>
            <p className="text-muted-foreground">{item.content}</p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
