"use client";

import type React from "react";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth-store";

export default function ForgotPasswordForm() {
  const router = useRouter();

  // Lấy các state và action từ auth store
  const {
    forgotPasswordForm,
    forgotPasswordFormError,
    isLoading,
    error,
    success,
    setForgotPasswordEmail,
    validateForgotPasswordEmail,
    forgotPassword,
    resetMessages,
  } = useAuthStore();

  // Reset error message khi component mount
  useEffect(() => {
    resetMessages();
  }, [resetMessages]);

  // Xử lý gửi form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Gọi API quên mật khẩu
    await forgotPassword();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CardTitle className="text-2xl font-bold text-center">
              Quên mật khẩu
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Nhập email của bạn để nhận liên kết đặt lại mật khẩu
            </CardDescription>
          </motion.div>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
                <h3 className="text-xl font-semibold">Yêu cầu đã được gửi!</h3>
                <p className="text-muted-foreground">
                  Chúng tôi đã gửi email đặt lại mật khẩu đến{" "}
                  <strong>{forgotPasswordForm.email}</strong>. Vui lòng kiểm tra
                  hộp thư đến của bạn.
                </p>
                <p className="text-sm text-muted-foreground">
                  Nếu bạn không nhận được email trong vòng vài phút, hãy kiểm
                  tra thư mục spam hoặc thử lại với một địa chỉ email khác.
                </p>
              </div>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/auth/login")}
                >
                  Quay lại đăng nhập
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={forgotPasswordForm.email}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    onBlur={validateForgotPasswordEmail}
                    className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                  />
                </div>
                {forgotPasswordFormError && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm font-medium text-destructive"
                  >
                    {forgotPasswordFormError}
                  </motion.p>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    "Gửi email đặt lại mật khẩu"
                  )}
                </Button>
              </motion.div>
            </form>
          )}
        </CardContent>
        {!success && (
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Nhớ mật khẩu?{" "}
              <Link href="/auth/login" className="text-primary hover:underline">
                Quay lại đăng nhập
              </Link>
            </p>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
