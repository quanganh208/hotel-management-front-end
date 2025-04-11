import { useEffect, useRef, useState } from "react";
import {
  ImagePlus,
  Loader2,
  Plus,
  X,
  User,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStaffStore } from "@/store/staff";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gender, StaffRole } from "@/types/staff";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export function CreateStaffDialog() {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const hotelId = params.id as string;
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);

  const {
    createStaffForm,
    createStaffFormErrors,
    isLoading,
    error,
    success,
    setCreateStaffForm,
    validateCreateStaffField,
    createStaff,
    resetCreateStaffForm,
    resetMessages,
  } = useStaffStore();

  const dialogRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Thiết lập hotelId khi dialog mở
  useEffect(() => {
    if (open && hotelId) {
      setCreateStaffForm("hotelId", hotelId);
      setActiveStep(1);
    }
  }, [open, hotelId, setCreateStaffForm]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (createStaffForm.image) {
      const url = URL.createObjectURL(createStaffForm.image as File);
      setImagePreviewUrl(url);

      // Cleanup function để giải phóng URL khi component unmount hoặc ảnh thay đổi
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [createStaffForm.image]);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetCreateStaffForm();
      resetMessages();
      setActiveStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeStep === 1) {
      // Kiểm tra tính hợp lệ của các trường thông tin cơ bản
      const isValid = validateBasicFields();
      if (isValid) {
        setActiveStep(2);
      }
    } else {
      await createStaff();
    }
  };

  const validateBasicFields = () => {
    const fields = [
      "name",
      "phoneNumber",
      "email",
      "role",
      "gender",
      "birthday",
    ];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateCreateStaffField(field as keyof typeof createStaffForm)) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Xử lý khi thành công hoặc lỗi
  useEffect(() => {
    console.log("Success state changed:", success);
    if (success) {
      console.log("Creation successful, closing dialog");
      setOpen(false);
      resetCreateStaffForm();
      resetMessages();
      setActiveStep(1);
    }
  }, [success, resetCreateStaffForm, resetMessages]);

  useEffect(() => {
    if (error) {
      resetMessages();
    }
  }, [error, resetMessages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error("Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, WEBP");
        return;
      }

      // Kiểm tra kích thước file (10MB = 10 * 1024 * 1024 bytes)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Kích thước ảnh không được vượt quá 10MB");
        return;
      }

      setCreateStaffForm("image", file);
    }
  };

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setCreateStaffForm("image", null);
  };

  // Xóa lỗi cho trường role
  const clearRoleError = () => {
    // Xóa lỗi bằng cách trực tiếp cập nhật state trong store
    useStaffStore.setState((state) => ({
      createStaffFormErrors: {
        ...state.createStaffFormErrors,
        role: "",
      },
    }));
  };

  // Xóa lỗi cho trường gender
  const clearGenderError = () => {
    // Xóa lỗi bằng cách trực tiếp cập nhật state trong store
    useStaffStore.setState((state) => ({
      createStaffFormErrors: {
        ...state.createStaffFormErrors,
        gender: "",
      },
    }));
  };

  // Xóa lỗi cho trường birthday
  const clearBirthdayError = () => {
    // Xóa lỗi bằng cách trực tiếp cập nhật state trong store
    useStaffStore.setState((state) => ({
      createStaffFormErrors: {
        ...state.createStaffFormErrors,
        birthday: "",
      },
    }));
  };

  // Theo dõi thay đổi của role và tự động xóa lỗi
  useEffect(() => {
    if (createStaffForm.role) {
      clearRoleError();
    }
  }, [createStaffForm.role]);

  // Theo dõi thay đổi của gender và tự động xóa lỗi
  useEffect(() => {
    if (createStaffForm.gender) {
      clearGenderError();
    }
  }, [createStaffForm.gender]);

  // Theo dõi thay đổi của birthday và tự động xóa lỗi
  useEffect(() => {
    if (createStaffForm.birthday) {
      clearBirthdayError();
    }
  }, [createStaffForm.birthday]);

  // Hiển thị nhãn chức vụ
  const getRoleLabel = (role: StaffRole) => {
    switch (role) {
      case StaffRole.MANAGER:
        return "Quản lý";
      case StaffRole.RECEPTIONIST:
        return "Lễ tân";
      case StaffRole.HOUSEKEEPING:
        return "Phục vụ";
      case StaffRole.ACCOUNTANT:
        return "Kế toán";
      default:
        return String(role);
    }
  };

  // Các tùy chọn chức vụ
  const roleOptions = Object.entries(StaffRole).map(([value]) => ({
    label: getRoleLabel(value as StaffRole),
    value,
  }));

  // Hiển thị giới tính
  const getGenderLabel = (gender?: Gender | string) => {
    if (!gender) return "Chưa cập nhật";

    switch (gender) {
      case Gender.MALE:
        return "Nam";
      case Gender.FEMALE:
        return "Nữ";
      case Gender.OTHER:
        return "Khác";
      default:
        return String(gender);
    }
  };

  // Các tùy chọn giới tính
  const genderOptions = Object.entries(Gender).map(([value]) => ({
    label: getGenderLabel(value as Gender),
    value,
  }));

  // Format ngày tháng
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";

    try {
      return format(new Date(dateString), "yyyy-MM-dd", {
        locale: vi,
      });
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error);
      return "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân viên
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden"
        ref={dialogRef}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="px-6 pt-6 pb-2">
            <DialogTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5" />
              Thêm nhân viên mới
            </DialogTitle>
            <DialogDescription>
              {activeStep === 1
                ? "Điền thông tin cơ bản của nhân viên"
                : "Hoàn tất thông tin chi tiết và xác nhận"}
            </DialogDescription>
          </DialogHeader>

          {/* Hiển thị các bước */}
          <div className="px-6 mt-2">
            <div className="flex items-center justify-between">
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={activeStep === 1 ? "default" : "outline"}
                    className="rounded-full h-8 px-3"
                  >
                    1. Thông tin cơ bản
                  </Badge>
                  <Separator className="flex-1" />
                  <Badge
                    variant={activeStep === 2 ? "default" : "outline"}
                    className="rounded-full h-8 px-3"
                  >
                    2. Thông tin bổ sung
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 pt-4">
            <AnimatePresence mode="wait">
              {activeStep === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Card className="border shadow-sm">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Thông tin nhân viên</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label
                            htmlFor="name"
                            className="flex items-center gap-1"
                          >
                            <User className="h-3.5 w-3.5" />
                            Tên nhân viên{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="name"
                            value={createStaffForm.name}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setCreateStaffForm("name", e.target.value)}
                            onBlur={() => validateCreateStaffField("name")}
                            className={cn(
                              createStaffFormErrors.name &&
                                "border-destructive",
                            )}
                            disabled={isLoading}
                            placeholder="Ví dụ: Nguyễn Văn A"
                          />
                          <div className="min-h-[20px]">
                            {createStaffFormErrors.name && (
                              <p className="text-sm text-destructive">
                                {createStaffFormErrors.name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label
                            htmlFor="phoneNumber"
                            className="flex items-center gap-1"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Số điện thoại{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            value={createStaffForm.phoneNumber}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                              setCreateStaffForm("phoneNumber", e.target.value)
                            }
                            onBlur={() =>
                              validateCreateStaffField("phoneNumber")
                            }
                            className={cn(
                              createStaffFormErrors.phoneNumber &&
                                "border-destructive",
                            )}
                            disabled={isLoading}
                            placeholder="Ví dụ: 0987654321"
                          />
                          <div className="min-h-[20px]">
                            {createStaffFormErrors.phoneNumber && (
                              <p className="text-sm text-destructive">
                                {createStaffFormErrors.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-1"
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={createStaffForm.email}
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>,
                            ) => setCreateStaffForm("email", e.target.value)}
                            onBlur={() => validateCreateStaffField("email")}
                            className={cn(
                              createStaffFormErrors.email &&
                                "border-destructive",
                            )}
                            disabled={isLoading}
                            placeholder="Ví dụ: example@gmail.com"
                          />
                          <div className="min-h-[20px]">
                            {createStaffFormErrors.email && (
                              <p className="text-sm text-destructive">
                                {createStaffFormErrors.email}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label
                            htmlFor="role"
                            className="flex items-center gap-1"
                          >
                            <User className="h-3.5 w-3.5" />
                            Chức vụ <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={createStaffForm.role}
                            onValueChange={(value) =>
                              setCreateStaffForm("role", value)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger
                              id="role"
                              className={cn(
                                createStaffFormErrors.role &&
                                  "border-destructive",
                              )}
                            >
                              <SelectValue placeholder="Chọn chức vụ" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Chức vụ</SelectLabel>
                                {roleOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className="min-h-[20px]">
                            {createStaffFormErrors.role && (
                              <p className="text-sm text-destructive">
                                {createStaffFormErrors.role}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label
                            htmlFor="gender"
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3.5 w-3.5" />
                            Giới tính{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Select
                            value={createStaffForm.gender}
                            onValueChange={(value) =>
                              setCreateStaffForm("gender", value)
                            }
                            disabled={isLoading}
                          >
                            <SelectTrigger
                              id="gender"
                              className={cn(
                                createStaffFormErrors.gender &&
                                  "border-destructive",
                              )}
                            >
                              <SelectValue placeholder="Chọn giới tính" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Giới tính</SelectLabel>
                                {genderOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <div className="min-h-[20px]">
                            {createStaffFormErrors.gender && (
                              <p className="text-sm text-destructive">
                                {createStaffFormErrors.gender}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Label
                            htmlFor="birthday"
                            className="flex items-center gap-1"
                          >
                            Ngày sinh{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="birthday"
                              type="date"
                              value={
                                createStaffForm.birthday
                                  ? formatDate(createStaffForm.birthday)
                                  : ""
                              }
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                              ) =>
                                setCreateStaffForm(
                                  "birthday",
                                  e.target.value
                                    ? new Date(e.target.value).toISOString()
                                    : "",
                                )
                              }
                              onBlur={() =>
                                validateCreateStaffField("birthday")
                              }
                              className={cn(
                                "pr-10",
                                createStaffFormErrors.birthday &&
                                  "border-destructive",
                              )}
                              disabled={isLoading}
                            />
                          </div>
                          <div className="min-h-[20px]">
                            {createStaffFormErrors.birthday && (
                              <p className="text-sm text-destructive">
                                {createStaffFormErrors.birthday}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <Card className="border shadow-sm">
                    <CardContent className="px-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <ImagePlus className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Ảnh đại diện (tùy chọn)</h3>
                      </div>

                      <div className="flex flex-col items-center gap-4">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative w-32 h-32 rounded-full overflow-hidden border bg-muted/30"
                        >
                          {imagePreviewUrl ? (
                            <Image
                              src={imagePreviewUrl}
                              alt="Xem trước ảnh đại diện"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <User className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}
                        </motion.div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className={cn(
                              "w-full",
                              createStaffForm.imageError &&
                                "border-destructive",
                            )}
                            disabled={isLoading}
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            {imagePreviewUrl ? "Thay đổi ảnh" : "Chọn ảnh"}
                          </Button>
                          {imagePreviewUrl && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={clearFileInput}
                              className="min-w-fit py-1 px-2"
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          <input
                            id="image"
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="min-h-[20px] text-center w-full">
                          {createStaffForm.imageError && (
                            <p className="text-sm text-destructive">
                              {createStaffForm.imageError}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm">
                    <CardContent className="px-4 space-y-4">
                      <div className="grid gap-2">
                        <Label
                          htmlFor="note"
                          className="flex items-center gap-1"
                        >
                          Ghi chú (tùy chọn)
                        </Label>
                        <Textarea
                          id="note"
                          value={createStaffForm.note}
                          onChange={(
                            e: React.ChangeEvent<HTMLTextAreaElement>,
                          ) => setCreateStaffForm("note", e.target.value)}
                          className="resize-none min-h-[120px]"
                          disabled={isLoading}
                          placeholder="Nhập thông tin thêm về nhân viên..."
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border shadow-sm bg-muted/30">
                    <CardContent className="px-4">
                      <h3 className="font-medium mb-2">Thông tin cơ bản</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Tên nhân viên:</span>{" "}
                          {createStaffForm.name}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Chức vụ:</span>
                          {createStaffForm.role
                            ? getRoleLabel(createStaffForm.role as StaffRole)
                            : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Số điện thoại:</span>{" "}
                          {createStaffForm.phoneNumber}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Email:</span>{" "}
                          {createStaffForm.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Giới tính:</span>
                          {createStaffForm.gender
                            ? getGenderLabel(createStaffForm.gender as Gender)
                            : ""}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Ngày sinh:</span>
                          {createStaffForm.birthday
                            ? formatDate(createStaffForm.birthday)
                            : ""}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <DialogFooter className="gap-2 flex flex-col sm:flex-row sm:justify-between">
                {activeStep === 1 ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenChange(false)}
                      disabled={isLoading}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Hủy
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      <Button type="submit" className="w-full">
                        Tiếp tục
                      </Button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveStep(1)}
                      disabled={isLoading}
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Quay lại
                    </Button>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full sm:w-auto order-1 sm:order-2"
                    >
                      <Button
                        type="submit"
                        className="relative w-full"
                        disabled={isLoading}
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin absolute left-3" />
                        )}
                        <span className={cn(isLoading && "pl-4")}>
                          {isLoading ? "Đang xử lý..." : "Tạo nhân viên"}
                        </span>
                      </Button>
                    </motion.div>
                  </>
                )}
              </DialogFooter>
            </motion.div>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
