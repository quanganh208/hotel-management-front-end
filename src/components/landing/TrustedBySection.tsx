import Image from "next/image";
import { motion } from "framer-motion";
import {
  fadeIn,
  staggerContainer,
  fadeInUp,
  AnimatedSection,
} from "./AnimationComponents";

export default function TrustedBySection() {
  return (
    <AnimatedSection>
      <section className="border-y bg-muted/40">
        <div className="container py-12">
          <motion.div className="text-center mb-8" variants={fadeInUp}>
            <h2 className="text-xl font-medium text-muted-foreground">
              Được tin dùng bởi hơn 500+ khách sạn trên toàn quốc
            </h2>
          </motion.div>
          <motion.div
            className="flex flex-wrap justify-center items-center gap-8 lg:gap-16"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {[1, 2, 3, 4, 5].map((i) => (
              <motion.div
                key={i}
                className="relative h-12 w-32 opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                variants={fadeIn}
                whileHover={{ scale: 1.1, opacity: 1, filter: "grayscale(0)" }}
              >
                <Image
                  src={`/placeholder.svg?height=100&width=150&text=Hotel${i}`}
                  alt={`Hotel Partner ${i}`}
                  fill
                  className="object-contain"
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </AnimatedSection>
  );
}
