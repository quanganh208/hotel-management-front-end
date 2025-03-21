"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import axiosInstance from "@/lib/axios";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export default function VerifyAccountForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");

  // Lấy email từ localStorage khi component được tải
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("verificationEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, []);

  // Validate mã xác thực
  const validateVerificationCode = (code: string) => {
    if (!code) {
      setVerificationCodeError("Vui lòng nhập mã xác thực");
      return false;
    }

    if (!/^\d+$/.test(code)) {
      setVerificationCodeError("Mã xác thực chỉ được chứa các chữ số");
      return false;
    }

    setVerificationCodeError("");
    return true;
  };

  // Xử lý gửi lại mã xác thực
  const handleResendCode = async () => {
    if (!email) {
      setError("Không tìm thấy email để gửi lại mã xác thực");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Gọi API gửi lại mã xác thực
      const formData = new URLSearchParams();
      formData.append("email", email);

      const response = await axiosInstance.post(
        "/auth/resend-verification",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      if (response.data?.message) {
        setSuccess("Đã gửi lại mã xác thực, vui lòng kiểm tra email của bạn");
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Không thể gửi lại mã xác thực. Vui lòng thử lại sau.");
      }
      console.error("Lỗi gửi lại mã:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý submit form xác thực
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Không tìm thấy email để xác thực");
      return;
    }

    const isVerificationCodeValid = validateVerificationCode(verificationCode);

    if (!isVerificationCodeValid) {
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Gọi API xác thực tài khoản
      const data = {
        email,
        verificationCode,
      };

      const response = await axiosInstance.post("/auth/activate", data);

      if (response.data?.message) {
        setSuccess("Xác thực tài khoản thành công");

        // Xóa email đã lưu trong localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("verificationEmail");
        }

        // Chờ 2 giây rồi chuyển hướng đến trang đăng nhập
        setTimeout(() => {
          router.push("/auth/login?verified=true");
        }, 2000);
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === "ECONNREFUSED") {
        setError(
          "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối hoặc thử lại sau."
        );
      } else {
        setError("Xác thực tài khoản không thành công. Vui lòng thử lại sau.");
      }
      console.error("Lỗi xác thực:", err);
    } finally {
      setIsLoading(false);
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
              Xác thực tài khoản
            </CardTitle>
            <CardDescription className="text-center pt-2">
              Vui lòng nhập mã xác thực đã được gửi đến email của bạn
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

          {email ? (
            <div className="text-center mb-4">
              <p className="text-muted-foreground">
                Chúng tôi đã gửi mã xác thực đến
              </p>
              <p className="font-medium">{email}</p>
            </div>
          ) : (
            <div className="text-center mb-4">
              <p className="text-muted-foreground">
                Không thể tìm thấy email để xác thực
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Mã xác thực</Label>
              <InputOTP
                maxLength={8}
                value={verificationCode}
                onChange={setVerificationCode}
                className="flex justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12" />
                  <InputOTPSlot index={1} className="h-12" />
                  <InputOTPSlot index={2} className="h-12" />
                  <InputOTPSlot index={3} className="h-12" />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={4} className="h-12" />
                  <InputOTPSlot index={5} className="h-12" />
                  <InputOTPSlot index={6} className="h-12" />
                  <InputOTPSlot index={7} className="h-12" />
                </InputOTPGroup>
              </InputOTP>
              {verificationCodeError && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-medium text-destructive"
                >
                  {verificationCodeError}
                </motion.p>
              )}
            </div>

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
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Không nhận được mã?{" "}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={handleResendCode}
              disabled={isLoading}
            >
              Gửi lại mã
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <Link
              href="/auth/login"
              className="text-primary hover:underline underline-offset-4"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
