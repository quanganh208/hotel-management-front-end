"use client";

import React, {useEffect, useState, useRef} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {Loader2} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {useAuthStore} from "@/store/auth-store";

// Thời gian đếm ngược (giây)
const COUNTDOWN_TIME = 30;

export default function VerifyAccountForm() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(COUNTDOWN_TIME);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const [isChecking, setIsChecking] = useState(true);
  const [isSendingCode, setIsSendingCode] = useState(false);

  const codeSentRef = useRef(false);
  // Lấy các state và action từ auth store
  const {
    verifyForm,
    verifyFormError,
    isLoading,
    error,
    success,
    setVerificationCode,
    verifyAccount,
    verificationCode,
    setError,
    resetMessages,
  } = useAuthStore();

  // Kiểm tra email ngay từ đầu trước khi render nội dung chính
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (!verifyForm.email) {
        const storedEmail = localStorage.getItem("verificationEmail");
        if (storedEmail) {
          // Cập nhật email trong store từ localStorage
          const {setRegisterForm} = useAuthStore.getState();
          setRegisterForm("email", storedEmail);
          setIsChecking(false);
        } else {
          // Redirect ngay nếu không tìm thấy email
          router.push('/');
        }
      } else {
        setIsChecking(false);
      }
    }
  }, [verifyForm.email, router]);

  useEffect(() => {
    if (verifyForm.email && !codeSentRef.current && !isChecking) {
      codeSentRef.current = true;
      setIsSendingCode(true);
      verificationCode().finally(() => {
        setIsSendingCode(false);
      });
    }
  }, [verifyForm.email, verificationCode, isChecking]);

  // Reset thông báo khi component mount
  useEffect(() => {
    resetMessages();
  }, [resetMessages]);

  // Xử lý bộ đếm ngược
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isCountdownActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsCountdownActive(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown, isCountdownActive]);

  // Nếu đang kiểm tra, trả về màn hình loading hoặc không trả về gì
  if (isChecking) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const handleSendCode = async () => {
    if (isCountdownActive) return;

    codeSentRef.current = true;
    setIsSendingCode(true);
    await verificationCode();
    setIsSendingCode(false);
    setCountdown(COUNTDOWN_TIME);
    setIsCountdownActive(true);
  };

  // Xử lý submit form xác thực
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra email
    if (!verifyForm.email) {
      setError("Không tìm thấy email để xác thực");
      return;
    }

    await verifyAccount();

    // Kiểm tra lại success sau khi verifyAccount hoàn thành
    const currentSuccess = useAuthStore.getState().success;
    if (currentSuccess) {
      setTimeout(() => {
        resetMessages();
        router.push("/auth/login");
      }, 2000);
    }
  };

  // Định dạng thời gian đếm ngược
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5}}
    >
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            transition={{delay: 0.2, duration: 0.5}}
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
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.3}}
              className="mb-4"
            >
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{opacity: 0, y: -20}}
              animate={{opacity: 1, y: 0}}
              transition={{duration: 0.3}}
              className="mb-4"
            >
              <Alert>
                <AlertDescription className="text-green-600">
                  {success}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {verifyForm.email ? (
            <div className="text-center mb-4">
              <p className="text-muted-foreground">
                Chúng tôi {isSendingCode ? 'đang gửi' : 'đã gửi'} mã xác thực đến
              </p>
              <p className="font-medium">{verifyForm.email}</p>
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
                value={verifyForm.verificationCode}
                onChange={setVerificationCode}
                className="flex justify-center"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-12"/>
                  <InputOTPSlot index={1} className="h-12"/>
                  <InputOTPSlot index={2} className="h-12"/>
                  <InputOTPSlot index={3} className="h-12"/>
                </InputOTPGroup>
                <InputOTPSeparator/>
                <InputOTPGroup>
                  <InputOTPSlot index={4} className="h-12"/>
                  <InputOTPSlot index={5} className="h-12"/>
                  <InputOTPSlot index={6} className="h-12"/>
                  <InputOTPSlot index={7} className="h-12"/>
                </InputOTPGroup>
              </InputOTP>
              {verifyFormError && (
                <motion.p
                  initial={{opacity: 0, height: 0}}
                  animate={{opacity: 1, height: "auto"}}
                  exit={{opacity: 0, height: 0}}
                  className="text-sm font-medium text-destructive"
                >
                  {verifyFormError}
                </motion.p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || isSendingCode}>
              {isLoading && !isSendingCode ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
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
              onClick={handleSendCode}
              disabled={isLoading || isCountdownActive || isSendingCode}
            >
              {isSendingCode ? (
                <>Đang gửi mã...</>
              ) : isCountdownActive ? (
                `Gửi lại mã (${formatCountdown()})`
              ) : (
                "Gửi lại mã"
              )}
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
