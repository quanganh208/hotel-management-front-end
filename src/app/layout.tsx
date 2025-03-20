import type React from "react";
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HotelManager Pro - Phần mềm quản lý khách sạn toàn diện",
  description:
    "Giải pháp quản lý khách sạn toàn diện, giúp tối ưu hóa vận hành và nâng cao trải nghiệm khách hàng.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
