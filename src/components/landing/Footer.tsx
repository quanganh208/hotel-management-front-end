import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Footer() {
  return (
    <motion.footer
      className="bg-muted/50 border-t py-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
    >
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ x: 5 }}
            >
              <Building2 className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">HotelManager Pro</span>
            </motion.div>
            <p className="text-muted-foreground">
              Giải pháp quản lý khách sạn toàn diện, giúp tối ưu hóa vận hành và
              nâng cao trải nghiệm khách hàng.
            </p>
            <div className="flex gap-4">
              {[
                <svg
                  key="facebook"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>,
                <svg
                  key="twitter"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>,
                <svg
                  key="instagram"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>,
                <svg
                  key="linkedin"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>,
              ].map((icon, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link
                    href="#"
                    className="h-8 w-8 rounded-full bg-muted flex items-center justify-center hover:bg-primary/20"
                  >
                    {icon}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          {[
            {
              title: "Sản phẩm",
              links: [
                { name: "Tính năng", href: "#features" },
                { name: "Bảng giá", href: "#pricing" },
                { name: "Tích hợp", href: "#" },
                { name: "Cập nhật mới", href: "#" },
              ],
            },
            {
              title: "Hỗ trợ",
              links: [
                { name: "Trung tâm trợ giúp", href: "#" },
                { name: "Hướng dẫn sử dụng", href: "#" },
                { name: "Cộng đồng", href: "#" },
                { name: "Đào tạo", href: "#" },
              ],
            },
            {
              title: "Công ty",
              links: [
                { name: "Về chúng tôi", href: "#" },
                { name: "Blog", href: "#" },
                { name: "Đối tác", href: "#" },
                { name: "Tuyển dụng", href: "#" },
              ],
            },
          ].map((section, i) => (
            <div key={i}>
              <h3 className="font-medium text-lg mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <motion.li key={j} whileHover={{ x: 5 }}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <motion.div
          className="mt-12 pt-8 border-t"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} HotelManager Pro. Tất cả các
              quyền được bảo lưu.
            </p>
            <div className="flex gap-6 items-center">
              {[
                { name: "Điều khoản sử dụng", href: "#" },
                { name: "Chính sách bảo mật", href: "#" },
                {
                  name: "Bảo mật dữ liệu",
                  href: "#",
                  icon: <ShieldCheck className="h-4 w-4 inline-block mr-1" />,
                },
              ].map((link, i) => (
                <motion.div key={i} whileHover={{ y: -2 }}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div whileHover={{ y: -2 }} className="flex items-center">
                <ThemeToggle />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
