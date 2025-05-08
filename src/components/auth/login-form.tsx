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
import TwoFactorForm from "./two-factor-form";

export default function LoginForm() {
  const router = useRouter();

  // Lấy các state và action từ auth store
  const {
    loginForm,
    loginFormErrors,
    isLoading,
    error,
    success,
    requiresTwoFactor,
    setLoginForm,
    validateLoginField,
    login,
    loginWithGoogle,
    resetMessages,
    setError,
  } = useAuthStore();

  // State cho hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  // Reset thông báo khi component mount và kiểm tra lỗi từ URL
  useEffect(() => {
    resetMessages();

    // Kiểm tra lỗi từ URL parameters
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const errorParam = url.searchParams.get("error");

      if (errorParam) {
        const decodedError = decodeURIComponent(errorParam);

        if (decodedError === "OAuthCallback") {
          setError(
            "Đăng nhập với Google không thành công. Vui lòng thử lại sau.",
          );
        } else if (decodedError !== "Callback") {
          setError(decodedError);
        }

        // Xóa param error khỏi URL để không hiển thị trong địa chỉ
        url.searchParams.delete("error");
        url.searchParams.delete("callbackUrl"); // Xóa cả callbackUrl nếu có
        window.history.replaceState({}, document.title, url.toString());
      }
    }
  }, [resetMessages, setError]);

  // Tự động cuộn lên đầu khi có lỗi xuất hiện
  useEffect(() => {
    if (error) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [error]);

  // Xử lý khi thay đổi giá trị input
  const handleInputChange = (field: "email" | "password", value: string) => {
    setLoginForm(field, value);
  };

  // Xử lý khi blur input để validate
  const handleInputBlur = (field: "email" | "password") => {
    validateLoginField(field);
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginSuccess = await login();

    if (loginSuccess) {
      // Chờ 1 giây để hiển thị thông báo thành công trước khi chuyển hướng
      setTimeout(() => {
        resetMessages();
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    }
  };

  const handleGoogleLogin = async () => {
    const loginSuccess = await loginWithGoogle();

    if (loginSuccess) {
      resetMessages();
      router.push("/dashboard");
      router.refresh();
    }
  };

  // Nếu cần xác thực 2FA, hiển thị form 2FA
  if (requiresTwoFactor) {
    return <TwoFactorForm />;
  }

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
              Đăng nhập vào Hệ thống Quản lý Khách sạn
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Chào mừng bạn quay trở lại! Đăng nhập để quản lý khách sạn của bạn
              một cách hiệu quả.
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
                <AlertDescription className="flex flex-wrap items-center gap-1">
                  {error.startsWith("INACTIVE_ACCOUNT:") ? (
                    <>
                      <span>{error.replace("INACTIVE_ACCOUNT:", "")}</span>
                      <Link
                        href="/auth/verify-account"
                        className="text-primary font-medium hover:underline inline-flex items-center"
                      >
                        Kích hoạt tài khoản ngay
                      </Link>
                    </>
                  ) : (
                    error
                  )}
                </AlertDescription>
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
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={loginForm.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  onBlur={() => handleInputBlur("email")}
                  className="transition-all duration-300 focus:ring-2 focus:ring-primary"
                />
              </div>
              {loginFormErrors.email && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {loginFormErrors.email}
                </motion.p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu của bạn"
                  value={loginForm.password}
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
              {loginFormErrors.password && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {loginFormErrors.password}
                </motion.p>
              )}
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </motion.div>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
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
              Đăng nhập với Google
            </Button>
          </motion.div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            <span className="text-muted-foreground">Chưa có tài khoản? </span>
            <Link
              href="/auth/register"
              className="text-primary font-medium hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
