"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";

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

export default function RegisterForm() {
  const router = useRouter();

  // Lấy các state và action từ auth store
  const {
    registerForm,
    registerFormErrors,
    isLoading,
    error,
    success,
    setRegisterForm,
    validateRegisterField,
    register,
    resetMessages,
  } = useAuthStore();

  // State cho hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Reset thông báo khi component mount
  useEffect(() => {
    resetMessages();
  }, [resetMessages]);

  // Chuyển hướng sau khi đăng ký thành công
  useEffect(() => {
    if (success) {
      // Chờ 1 giây rồi chuyển hướng để người dùng thấy thông báo thành công
      const redirectTimer = setTimeout(() => {
        // Reset thông báo trước khi chuyển hướng
        resetMessages();
        router.push("/auth/verify-account");
      }, 1000);

      return () => clearTimeout(redirectTimer);
    }
  }, [success, router, resetMessages]);

  // Xử lý khi thay đổi giá trị input
  const handleInputChange = (
    field: "name" | "email" | "password" | "confirmPassword",
    value: string,
  ) => {
    setRegisterForm(field, value);
  };

  // Xử lý khi blur input để validate
  const handleInputBlur = (
    field: "name" | "email" | "password" | "confirmPassword",
  ) => {
    validateRegisterField(field);
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register();
  };

  const handleGoogleSignup = async () => {
    // Giữ nguyên Google signup logic
    try {
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
    }
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
              Đăng ký tài khoản mới
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Tạo tài khoản để sử dụng Hệ thống Quản lý Khách sạn
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

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4"
            >
              <Alert>
                <AlertDescription className="text-green-600">
                  {success}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và tên</Label>
              <div className="relative">
                <Input
                  id="name"
                  type="text"
                  placeholder="Nhập họ và tên của bạn"
                  value={registerForm.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  onBlur={() => handleInputBlur("name")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                />
              </div>
              {registerFormErrors.name && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {registerFormErrors.name}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={registerForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleInputBlur("email")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                />
              </div>
              {registerFormErrors.email && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {registerFormErrors.email}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={registerForm.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  onBlur={() => handleInputBlur("password")}
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {registerFormErrors.password && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {registerFormErrors.password}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu của bạn"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  onBlur={() => handleInputBlur("confirmPassword")}
                  className="pr-10 transition-all duration-300 focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {registerFormErrors.confirmPassword && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {registerFormErrors.confirmPassword}
                </motion.p>
              )}
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </motion.div>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              variant="outline"
              type="button"
              className="w-full"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg
                  className="mr-2 h-4 w-4"
                  aria-hidden="true"
                  focusable="false"
                  data-prefix="fab"
                  data-icon="google"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 488 512"
                >
                  <path
                    fill="currentColor"
                    d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                  ></path>
                </svg>
              )}
              Đăng ký với Google
            </Button>
          </motion.div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Đã có tài khoản?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
