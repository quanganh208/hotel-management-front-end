"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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

export default function TwoFactorForm() {
  const router = useRouter();
  const {
    twoFactorForm,
    twoFactorFormErrors,
    isLoading,
    error,
    success,
    setTwoFactorForm,
    validateTwoFactorField,
    verifyTwoFactor,
    resetMessages,
  } = useAuthStore();

  // Xử lý khi thay đổi giá trị input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Chỉ cho phép nhập số
    if (/^\d*$/.test(value) && value.length <= 6) {
      setTwoFactorForm("code", value);
    }
  };

  // Xử lý khi blur input để validate
  const handleInputBlur = () => {
    validateTwoFactorField("code");
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateTwoFactorField("code")) {
      return;
    }

    const success = await verifyTwoFactor();

    if (success) {
      // Chờ 1 giây để hiển thị thông báo thành công trước khi chuyển hướng
      setTimeout(() => {
        resetMessages();
        router.push("/dashboard");
        router.refresh();
      }, 1000);
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
              Xác thực hai yếu tố
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Nhập mã xác thực từ ứng dụng xác thực của bạn để tiếp tục đăng
              nhập
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code">Mã xác thực</Label>
              <div className="relative">
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  placeholder="Nhập mã 6 chữ số"
                  value={twoFactorForm.code}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  className="text-center text-lg tracking-widest transition-all duration-300 focus:ring-2 focus:ring-primary"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>
              {twoFactorFormErrors.code && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {twoFactorFormErrors.code}
                </motion.p>
              )}
            </div>

            <div className="pt-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    "Xác thực"
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            <p>
              Mã xác thực được tạo mới mỗi 30 giây trong ứng dụng xác thực của
              bạn.
            </p>
            <p className="mt-1">
              Nếu bạn không thể truy cập ứng dụng xác thực, hãy sử dụng một
              trong các mã dự phòng đã được cung cấp.
            </p>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
