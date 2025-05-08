"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import axiosInstance from "@/lib/axios";

export default function SecurityTab() {
  return (
    <div className="space-y-8">
      <PasswordSection />
      <Separator className="my-8" />
      <TwoFactorSection />
    </div>
  );
}

function PasswordSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Tính toán độ mạnh của mật khẩu nếu đang nhập mật khẩu mới
    if (name === "newPassword") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback("");
      return;
    }

    let strength = 0;
    let feedback = "";

    // Độ dài
    if (password.length >= 6) {
      strength += 25;
    }

    // Chữ thường
    if (/[a-z]/.test(password)) {
      strength += 25;
    }

    // Chữ hoa
    if (/[A-Z]/.test(password)) {
      strength += 25;
    }

    // Số hoặc ký tự đặc biệt
    if (/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      strength += 25;
    }

    // Phản hồi dựa trên độ mạnh
    if (strength <= 25) {
      feedback = "Yếu";
    } else if (strength <= 50) {
      feedback = "Trung bình";
    } else if (strength <= 75) {
      feedback = "Khá";
    } else {
      feedback = "Mạnh";
    }

    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Kiểm tra mật khẩu hiện tại
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    }

    // Kiểm tra mật khẩu mới
    if (!formData.newPassword) {
      newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword =
        "Mật khẩu mới không được trùng với mật khẩu hiện tại";
    }

    // Kiểm tra xác nhận mật khẩu
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu mới";
    } else if (formData.confirmPassword !== formData.newPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsLoading(true);

    try {
      // Gọi API đổi mật khẩu
      await axiosInstance.patch("/users/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success("Mật khẩu đã được thay đổi thành công");

      // Reset form sau khi đổi mật khẩu thành công
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(0);
      setPasswordFeedback("");
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Xử lý các lỗi cụ thể từ API
      if (error.response) {
        const { status, data } = error.response;

        if (status === 400) {
          // Lỗi validation từ server
          if (data.message === "Mật khẩu hiện tại không đúng") {
            setErrors((prev) => ({
              ...prev,
              currentPassword: "Mật khẩu hiện tại không đúng",
            }));
            toast.error("Mật khẩu hiện tại không đúng");
          } else {
            toast.error(data.message || "Có lỗi xảy ra khi thay đổi mật khẩu");
          }
        } else if (status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        } else {
          toast.error("Có lỗi xảy ra khi thay đổi mật khẩu");
        }
      } else {
        toast.error("Không thể kết nối đến máy chủ");
      }

      console.error("Lỗi khi đổi mật khẩu:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-destructive";
    if (passwordStrength <= 50) return "bg-orange-500";
    if (passwordStrength <= 75) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <Card className="overflow-hidden border-2">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl"></div>

      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary" />
          <CardTitle>Đổi mật khẩu</CardTitle>
        </div>
        <CardDescription>
          Cập nhật mật khẩu của bạn để bảo vệ tài khoản
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="grid gap-3">
            <Label htmlFor="currentPassword" className="font-medium">
              Mật khẩu hiện tại <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="currentPassword"
                name="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                className={`pr-10 bg-background/50 ${errors.currentPassword ? "border-destructive" : ""}`}
                placeholder="Nhập mật khẩu hiện tại"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-sm text-destructive">
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="newPassword" className="font-medium">
              Mật khẩu mới <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                className={`pr-10 bg-background/50 ${errors.newPassword ? "border-destructive" : ""}`}
                placeholder="Nhập mật khẩu mới"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.newPassword ? (
              <p className="text-sm text-destructive">{errors.newPassword}</p>
            ) : (
              formData.newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Độ mạnh:</span>
                    <Badge
                      variant={
                        passwordStrength <= 25
                          ? "destructive"
                          : passwordStrength <= 50
                            ? "secondary"
                            : passwordStrength <= 75
                              ? "default"
                              : "success"
                      }
                    >
                      {passwordFeedback}
                    </Badge>
                  </div>
                  <Progress
                    value={passwordStrength}
                    className={`h-1.5 ${getPasswordStrengthColor()}`}
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      {/[a-z]/.test(formData.newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>Chữ thường</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/[A-Z]/.test(formData.newPassword) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>Chữ hoa</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                        formData.newPassword,
                      ) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>Số/Ký tự đặc biệt</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {formData.newPassword.length >= 6 ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <XCircle className="h-3 w-3 text-muted-foreground" />
                      )}
                      <span>Ít nhất 6 ký tự</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="confirmPassword" className="font-medium">
              Xác nhận mật khẩu mới <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`pr-10 bg-background/50 ${errors.confirmPassword ? "border-destructive" : ""}`}
                placeholder="Nhập lại mật khẩu mới"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t py-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
              setPasswordStrength(0);
              setPasswordFeedback("");
              setErrors({});
            }}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading} className="px-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Cập nhật mật khẩu"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

function TwoFactorSection() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [otpAuthUrl, setOtpAuthUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disableMode, setDisableMode] = useState(false);
  const [setupStep, setSetupStep] = useState<"info" | "qr" | "verify">("info");

  // Kiểm tra trạng thái 2FA khi component được tải
  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      try {
        // Sử dụng API chuyên biệt để kiểm tra trạng thái 2FA
        const response = await axiosInstance.get("/auth/2fa/status");
        if (response.data && response.data.isTwoFactorEnabled !== undefined) {
          setIs2FAEnabled(response.data.isTwoFactorEnabled);
        }
      } catch (error) {
        console.error("Không thể kiểm tra trạng thái 2FA:", error);
      }
    };

    checkTwoFactorStatus();
  }, []);

  const startSetup = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/auth/2fa/setup");
      setQrCodeUrl(response.data.qrCodeUrl);
      setOtpAuthUrl(response.data.otpAuthUrl);
      setShowSetup(true);
      setDisableMode(false);
      setSetupStep("qr");
    } catch (error) {
      toast.error("Không thể thiết lập xác thực 2 yếu tố");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle2FA = async (checked: boolean) => {
    if (checked && !is2FAEnabled) {
      setSetupStep("info");
      setShowSetup(true);
      return;
    }

    // Nếu đang bật và muốn tắt
    if (is2FAEnabled && !checked) {
      setDisableMode(true);
      setShowSetup(true);
      return;
    }
  };

  const validateOTP = (code: string): boolean => {
    if (!code) {
      setOtpError("Vui lòng nhập mã xác thực");
      return false;
    }

    if (!/^\d{6}$/.test(code)) {
      setOtpError("Mã xác thực phải là 6 chữ số");
      return false;
    }

    setOtpError("");
    return true;
  };

  const handleSetup2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateOTP(otpCode)) {
      return;
    }

    setIsLoading(true);

    try {
      if (disableMode) {
        // Tắt 2FA
        const response = await axiosInstance.post("/auth/2fa/disable", {
          code: otpCode,
        });
        setIs2FAEnabled(false);
        setShowSetup(false);
        setOtpCode("");
        toast.success(response.data.message || "Xác thực 2 yếu tố đã được tắt");
      } else {
        // Xác thực và bật 2FA
        const response = await axiosInstance.post("/auth/2fa/verify", {
          code: otpCode,
        });
        setBackupCodes(response.data.backupCodes);
        setShowBackupCodes(true);
        setIs2FAEnabled(true);
        toast.success("Xác thực 2 yếu tố đã được bật");
      }
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Có lỗi xảy ra khi thiết lập xác thực 2 yếu tố";
      toast.error(errorMessage);
      setOtpError(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseBackupCodes = () => {
    setShowBackupCodes(false);
    setShowSetup(false);
    setOtpCode("");
    setSetupStep("info");
  };

  const handleCancelSetup = () => {
    setShowSetup(false);
    setOtpCode("");
    setOtpError("");
    setDisableMode(false);
    setSetupStep("info");
  };

  return (
    <Card className="overflow-hidden border-2">
      <div className="absolute left-0 bottom-0 h-24 w-24 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 blur-3xl"></div>

      <CardHeader className="border-b">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <CardTitle>Xác thực 2 yếu tố</CardTitle>
        </div>
        <CardDescription>
          Tăng cường bảo mật cho tài khoản của bạn bằng xác thực 2 yếu tố
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Trạng thái 2FA */}
        <div
          className={`flex items-center justify-between p-4 rounded-lg ${is2FAEnabled ? "bg-green-500/10 border border-green-500/30" : "bg-muted/50"}`}
        >
          <div>
            <h3 className="font-medium flex items-center gap-2">
              {is2FAEnabled && (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              Trạng thái xác thực 2 yếu tố
            </h3>
            <p
              className={`text-sm ${is2FAEnabled ? "text-green-600" : "text-muted-foreground"}`}
            >
              {is2FAEnabled
                ? "Đã bật xác thực 2 yếu tố"
                : "Chưa bật xác thực 2 yếu tố"}
            </p>
          </div>
          <Switch
            checked={is2FAEnabled}
            onCheckedChange={handleToggle2FA}
            disabled={isLoading}
          />
        </div>

        {/* Thông tin về 2FA khi chưa bật và không trong quá trình thiết lập */}
        {!showSetup && !is2FAEnabled && (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-dashed p-6">
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium">
                  Bảo vệ tài khoản của bạn
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  Xác thực 2 yếu tố giúp bảo vệ tài khoản của bạn bằng cách yêu
                  cầu một mã xác thực bổ sung khi đăng nhập, ngay cả khi ai đó
                  biết mật khẩu của bạn.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowSetup(true)}
                >
                  Thiết lập ngay
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 items-center text-center">
                  <div className="rounded-full bg-blue-500/10 p-2">
                    <span className="text-xl font-bold text-blue-500">1</span>
                  </div>
                  <h4 className="font-medium">Thiết lập ứng dụng</h4>
                  <p className="text-xs text-muted-foreground">
                    Cài đặt ứng dụng xác thực như Google Authenticator hoặc
                    Authy
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 items-center text-center">
                  <div className="rounded-full bg-blue-500/10 p-2">
                    <span className="text-xl font-bold text-blue-500">2</span>
                  </div>
                  <h4 className="font-medium">Quét mã QR</h4>
                  <p className="text-xs text-muted-foreground">
                    Quét mã QR hoặc nhập mã bí mật vào ứng dụng xác thực
                  </p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex flex-col gap-2 items-center text-center">
                  <div className="rounded-full bg-blue-500/10 p-2">
                    <span className="text-xl font-bold text-blue-500">3</span>
                  </div>
                  <h4 className="font-medium">Nhập mã xác thực</h4>
                  <p className="text-xs text-muted-foreground">
                    Nhập mã 6 chữ số từ ứng dụng để hoàn tất thiết lập
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quá trình thiết lập 2FA */}
        {showSetup && !showBackupCodes && (
          <div className="mt-6">
            {/* Bước 1: Thông tin về 2FA */}
            {setupStep === "info" && !disableMode && (
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-medium">
                      Thiết lập xác thực 2 yếu tố
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Để bắt đầu, bạn cần cài đặt một ứng dụng xác thực trên
                      thiết bị di động của mình. Các ứng dụng phổ biến bao gồm:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 rounded-md border p-3">
                        <div className="rounded-full bg-blue-500/10 p-2">
                          <span className="font-bold text-blue-500">GA</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Google Authenticator</h4>
                          <p className="text-xs text-muted-foreground">
                            Android & iOS
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 rounded-md border p-3">
                        <div className="rounded-full bg-blue-500/10 p-2">
                          <span className="font-bold text-blue-500">AU</span>
                        </div>
                        <div>
                          <h4 className="font-medium">Authy</h4>
                          <p className="text-xs text-muted-foreground">
                            Android & iOS
                          </p>
                        </div>
                      </div>
                    </div>

                    <Alert className="bg-yellow-500/10 border-yellow-500/30">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <AlertDescription className="text-yellow-600">
                        Đảm bảo bạn đã cài đặt một trong các ứng dụng xác thực
                        trên trước khi tiếp tục.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelSetup}
                  >
                    Hủy
                  </Button>
                  <Button onClick={startSetup} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang tải...
                      </>
                    ) : (
                      "Tiếp tục"
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Bước 2: Quét mã QR */}
            {setupStep === "qr" && !disableMode && (
              <div className="space-y-6">
                <div className="rounded-lg border p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Quét mã QR</h3>
                      <Badge variant="outline">Bước 2/3</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Mở ứng dụng xác thực trên thiết bị di động của bạn và quét
                      mã QR bên dưới.
                    </p>

                    {qrCodeUrl && (
                      <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code for 2FA"
                          className="h-56 w-56 border rounded-md"
                        />
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">
                            Không thể quét mã QR? Nhập mã này vào ứng dụng xác
                            thực:
                          </p>
                          {otpAuthUrl && (
                            <div className="flex items-center gap-2 justify-center">
                              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                                {otpAuthUrl.split("secret=")[1]}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    otpAuthUrl.split("secret=")[1],
                                  );
                                  toast.success("Đã sao chép mã bí mật");
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <rect
                                    width="14"
                                    height="14"
                                    x="8"
                                    y="8"
                                    rx="2"
                                    ry="2"
                                  />
                                  <path d="M4 16c0-1.1.9-2 2-2h2" />
                                  <path d="M4 8c0-1.1.9-2 2-2h2" />
                                </svg>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSetup2FA} className="space-y-6">
                  <div className="grid gap-3">
                    <Label htmlFor="otpCode" className="font-medium">
                      Nhập mã xác thực từ ứng dụng{" "}
                      <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="otpCode"
                        name="otpCode"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value);
                          if (otpError) setOtpError("");
                        }}
                        className={`bg-background/50 text-center text-lg tracking-widest ${otpError ? "border-destructive" : ""}`}
                        placeholder="000000"
                        maxLength={6}
                      />
                    </div>
                    {otpError && (
                      <p className="text-sm text-destructive">{otpError}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancelSetup}
                      disabled={isLoading}
                    >
                      Hủy
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Đang xác thực...
                        </>
                      ) : (
                        "Xác nhận"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Tắt 2FA */}
            {disableMode && (
              <div className="space-y-6">
                <div className="rounded-lg border border-destructive/30 p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <h3 className="text-lg font-medium">
                        Tắt xác thực 2 yếu tố
                      </h3>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Bạn đang tắt lớp bảo mật bổ sung cho tài khoản của mình.
                      Điều này sẽ làm giảm mức độ bảo mật của tài khoản.
                    </p>

                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Sau khi tắt, các mã dự phòng cũ sẽ không còn hoạt động
                        và bạn sẽ không cần mã xác thực khi đăng nhập.
                      </AlertDescription>
                    </Alert>

                    <form onSubmit={handleSetup2FA} className="space-y-4">
                      <div className="grid gap-3">
                        <Label htmlFor="otpCode" className="font-medium">
                          Nhập mã xác thực để tắt 2FA{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="otpCode"
                            name="otpCode"
                            value={otpCode}
                            onChange={(e) => {
                              setOtpCode(e.target.value);
                              if (otpError) setOtpError("");
                            }}
                            className={`bg-background/50 text-center text-lg tracking-widest ${otpError ? "border-destructive" : ""}`}
                            placeholder="000000"
                            maxLength={6}
                          />
                        </div>
                        {otpError && (
                          <p className="text-sm text-destructive">{otpError}</p>
                        )}
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelSetup}
                          disabled={isLoading}
                        >
                          Hủy
                        </Button>
                        <Button
                          type="submit"
                          variant="destructive"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : (
                            "Tắt xác thực 2 yếu tố"
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hiển thị mã dự phòng */}
        {showBackupCodes && (
          <div className="mt-6 space-y-6">
            <div className="rounded-lg border p-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <h3 className="text-lg font-medium">
                      Thiết lập thành công!
                    </h3>
                  </div>
                  <Badge variant="success">Hoàn tất</Badge>
                </div>

                <p className="text-sm text-muted-foreground">
                  Xác thực 2 yếu tố đã được bật cho tài khoản của bạn. Lưu các
                  mã dự phòng dưới đây để sử dụng khi bạn không thể truy cập
                  thiết bị xác thực.
                </p>

                <Alert className="bg-yellow-500/10 border-yellow-500/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-yellow-600 font-medium">
                    Đây là lần duy nhất các mã dự phòng được hiển thị. Hãy lưu
                    chúng ở nơi an toàn!
                  </AlertDescription>
                </Alert>

                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Mã dự phòng của bạn</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-xs"
                      onClick={() => {
                        navigator.clipboard.writeText(backupCodes.join("\n"));
                        toast.success("Đã sao chép tất cả mã dự phòng");
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <rect
                          width="14"
                          height="14"
                          x="8"
                          y="8"
                          rx="2"
                          ry="2"
                        />
                        <path d="M4 16c0-1.1.9-2 2-2h2" />
                        <path d="M4 8c0-1.1.9-2 2-2h2" />
                      </svg>
                      Sao chép tất cả
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded bg-background p-2 font-mono text-sm border"
                      >
                        <span>{code}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => {
                            navigator.clipboard.writeText(code);
                            toast.success(`Đã sao chép mã: ${code}`);
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              width="14"
                              height="14"
                              x="8"
                              y="8"
                              rx="2"
                              ry="2"
                            />
                            <path d="M4 16c0-1.1.9-2 2-2h2" />
                            <path d="M4 8c0-1.1.9-2 2-2h2" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleCloseBackupCodes}>Hoàn tất</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
