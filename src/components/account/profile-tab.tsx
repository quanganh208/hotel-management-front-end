"use client";

import { useState, useRef, ChangeEvent } from "react";
import { User } from "next-auth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Camera, BadgeCheck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface UserProfile {
  _id: string;
  email: string;
  name: string;
  role: string;
  accountType: string;
  image: string;
  isVerified: boolean;
  phoneNumber?: string;
  gender?: string;
  birthday?: string;
}

interface ProfileTabProps {
  user: User | undefined;
  userProfile: UserProfile | null;
  onUpdateProfile: (formData: FormData) => Promise<boolean>;
}

export default function ProfileTab({
  user,
  userProfile,
  onUpdateProfile,
}: ProfileTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: userProfile?.name || user?.name || "",
    email: userProfile?.email || user?.email || "",
    phoneNumber: userProfile?.phoneNumber || "",
    gender: userProfile?.gender || "",
    birthday: userProfile?.birthday
      ? userProfile.birthday.substring(0, 10)
      : "",
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
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Xóa lỗi khi người dùng sửa trường
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      // Kiểm tra loại file
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh hợp lệ");
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Kiểm tra tên
    if (!formData.name.trim()) {
      newErrors.name = "Họ và tên không được để trống";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Họ và tên phải có ít nhất 2 ký tự";
    }

    // Kiểm tra số điện thoại nếu có
    if (formData.phoneNumber) {
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Số điện thoại không hợp lệ";
      }
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
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);

      if (formData.phoneNumber) {
        formDataToSend.append("phoneNumber", formData.phoneNumber);
      }

      if (formData.gender) {
        formDataToSend.append("gender", formData.gender);
      }

      if (formData.birthday) {
        formDataToSend.append("birthday", formData.birthday);
      }

      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      const success = await onUpdateProfile(formDataToSend);

      if (success) {
        // Đã hiển thị thông báo thành công trong hàm onUpdateProfile
        setSelectedImage(null);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const avatarFallback =
    userProfile?.name || user?.name
      ? (userProfile?.name || user?.name || "")
          .split(" ")
          .map((name) => name[0])
          .join("")
          .toUpperCase()
          .substring(0, 2)
      : "ND";

  const avatarSrc =
    previewImage ||
    userProfile?.image ||
    user?.image ||
    `/api/avatar?name=${encodeURIComponent(userProfile?.name || user?.name || "User")}`;

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toUpperCase()) {
      case "OWNER":
        return "bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600";
      case "MANAGER":
        return "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600";
      case "RECEPTIONIST":
        return "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600";
      case "HOUSEKEEPING":
        return "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600";
      case "ACCOUNTANT":
        return "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600";
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "OWNER":
        return "Chủ khách sạn";
      case "MANAGER":
        return "Quản lý";
      case "RECEPTIONIST":
        return "Lễ tân";
      case "HOUSEKEEPING":
        return "Phục vụ";
      case "ACCOUNTANT":
        return "Kế toán";
      default:
        return String(role);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="overflow-hidden border-2">
        <div className="absolute right-0 top-0 h-24 w-24 translate-x-1/2 -translate-y-1/2 transform rounded-full bg-gradient-to-br from-primary/20 to-primary/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-gradient-to-tr from-primary/20 to-primary/5 blur-3xl"></div>

        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Thông tin cá nhân</CardTitle>
              <CardDescription>
                Cập nhật thông tin cá nhân của bạn
              </CardDescription>
            </div>
            {userProfile?.isVerified && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 px-3 py-1.5 border-green-500/50 text-green-500"
              >
                <BadgeCheck className="h-4 w-4" />
                <span>Đã xác thực</span>
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-8">
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                  <AvatarImage
                    src={avatarSrc}
                    alt={userProfile?.name || user?.name || "Người dùng"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/80 to-primary">
                    {avatarFallback}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-9 w-9 shadow-lg opacity-90 hover:opacity-100 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
              {selectedImage && (
                <p className="text-xs text-muted-foreground">
                  {selectedImage.name}
                </p>
              )}

              {userProfile?.role && (
                <Badge
                  className={`${getRoleBadgeColor(userProfile.role)} text-white font-medium px-3 py-1`}
                >
                  {getRoleLabel(userProfile.role)}
                </Badge>
              )}
            </div>
            <div className="grid w-full gap-5">
              <div className="grid gap-2">
                <Label htmlFor="name" className="font-medium">
                  Họ và tên <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`bg-background/50 ${errors.name ? "border-destructive" : ""}`}
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    className="bg-muted/30 pr-10"
                    disabled
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Email đã được liên kết với tài khoản{" "}
                  {userProfile?.accountType || "của bạn"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber" className="font-medium">
                Số điện thoại
              </Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                className={`bg-background/50 ${errors.phoneNumber ? "border-destructive" : ""}`}
                placeholder="Nhập số điện thoại của bạn"
              />
              {errors.phoneNumber ? (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Số điện thoại sẽ được sử dụng để liên hệ khi cần thiết
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender" className="font-medium">
                Giới tính
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender" className="bg-background/50">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="birthday" className="font-medium">
              Ngày sinh
            </Label>
            <Input
              id="birthday"
              name="birthday"
              type="date"
              value={formData.birthday}
              onChange={handleChange}
              className="bg-background/50"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2 border-t py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                name: userProfile?.name || user?.name || "",
                email: userProfile?.email || user?.email || "",
                phoneNumber: userProfile?.phoneNumber || "",
                gender: userProfile?.gender || "",
                birthday: userProfile?.birthday
                  ? userProfile.birthday.substring(0, 10)
                  : "",
              });
              setPreviewImage(null);
              setSelectedImage(null);
              setErrors({});
            }}
            disabled={isLoading}
          >
            Hủy thay đổi
          </Button>
          <Button type="submit" disabled={isLoading} className="px-6">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
