import { useEffect, useState } from "react";
import { useStaffStore } from "@/store/staff";
import { Gender, Staff, StaffRole } from "@/types/staff";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Edit,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  Trash,
  User,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface StaffDetailDialogProps {
  staff: Staff;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StaffDetailDialog({
  staff,
  open,
  onOpenChange,
}: StaffDetailDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);

  const {
    updateStaffForm,
    updateStaffFormErrors,
    isLoading,
    setUpdateStaffForm,
    validateUpdateStaffField,
    updateStaff,
    deleteStaff,
    resetUpdateStaffForm,
    setUpdateFormFromStaff,
    resetMessages,
  } = useStaffStore();

  // Khởi tạo form khi mở dialog
  useEffect(() => {
    if (open && staff) {
      setUpdateFormFromStaff(staff);
      setImagePreviewUrl(staff.image || null);
      setIsImageChanged(false);
      setIsEditing(false);
    }
  }, [open, staff, setUpdateFormFromStaff]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (updateStaffForm.image && isImageChanged) {
      const url = URL.createObjectURL(updateStaffForm.image as File);
      setImagePreviewUrl(url);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [updateStaffForm.image, isImageChanged]);

  const handleClose = () => {
    setIsEditing(false);
    setIsDeleting(false);
    resetUpdateStaffForm();
    onOpenChange(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Hủy chỉnh sửa, quay lại dữ liệu ban đầu
      setUpdateFormFromStaff(staff);
      setImagePreviewUrl(staff.image || null);
      setIsImageChanged(false);
      resetMessages();
    }
    setIsEditing(!isEditing);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error("Chỉ chấp nhận các định dạng: JPG, JPEG, PNG, WEBP");
        return;
      }

      // Kiểm tra kích thước file (10MB)
      const MAX_FILE_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Kích thước ảnh không được vượt quá 10MB");
        return;
      }

      setUpdateStaffForm("image", file);
      setIsImageChanged(true);
    }
  };

  const handleSaveChanges = async () => {
    // Lấy hotelId từ staff hiện tại
    const hotelId = staff.hotels?.[0];
    console.log("Updating staff with hotelId:", hotelId);

    const success = await updateStaff(staff._id, hotelId);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleDeleteStaff = async () => {
    // Lấy hotelId từ staff hiện tại
    const hotelId = staff.hotels?.[0];
    console.log("Deleting staff with hotelId:", hotelId);

    const success = await deleteStaff(staff._id, hotelId);
    if (success) {
      handleClose();
    }
  };

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
        return role;
    }
  };

  // Các tùy chọn chức vụ
  const roleOptions = Object.entries(StaffRole).map(([value]) => ({
    label: getRoleLabel(value as StaffRole),
    value,
  }));

  // Format ngày tháng
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Chưa cập nhật";

    try {
      return format(new Date(dateString), "dd/MM/yyyy", {
        locale: vi,
      });
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error);
      return "Không hợp lệ";
    }
  };

  // Màu badge dựa trên vai trò
  const getRoleBadgeVariant = (role: StaffRole) => {
    switch (role) {
      case StaffRole.MANAGER:
        return "default";
      case StaffRole.RECEPTIONIST:
        return "secondary";
      case StaffRole.HOUSEKEEPING:
        return "outline";
      case StaffRole.ACCOUNTANT:
        return "destructive";
      default:
        return "default";
    }
  };

  // Hiển thị giới tính
  const getGenderLabel = (gender?: Gender) => {
    if (!gender) return "Chưa cập nhật";

    switch (gender) {
      case Gender.MALE:
        return "Nam";
      case Gender.FEMALE:
        return "Nữ";
      case Gender.OTHER:
        return "Khác";
      default:
        return "Chưa cập nhật";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: { duration: 0.2 },
    },
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`sm:max-w-[700px] h-[500px] overflow-hidden flex flex-col ${
            isEditing ? "[&>button]:hidden" : ""
          }`}
        >
          <DialogHeader className="px-6 pb-2 sticky top-0 bg-background">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <DialogTitle className="text-xl flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Chỉnh sửa thông tin nhân viên
                  </>
                ) : (
                  <>
                    <User className="h-5 w-5" />
                    {staff.name}
                  </>
                )}
              </DialogTitle>
            </motion.div>
            <DialogDescription>
              {isEditing
                ? "Cập nhật thông tin nhân viên trong form bên dưới"
                : `Chi tiết nhân viên ${staff.employeeCode}`}
            </DialogDescription>
          </DialogHeader>

          <AnimatePresence mode="wait" initial={false}>
            {isEditing ? (
              <motion.div
                key="edit-form"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="px-6 space-y-6 flex-1 overflow-y-auto"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="relative w-40 h-40 mx-auto md:mx-0 rounded-full overflow-hidden border bg-muted/30 shrink-0">
                    <div className="flex flex-col items-center justify-center h-full">
                      {imagePreviewUrl ? (
                        <Image
                          src={imagePreviewUrl}
                          fill
                          sizes="(max-width: 160px) 100vw, 160px"
                          className="object-cover"
                          alt="Xem trước"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-muted">
                          <UserCog className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                      )}
                      <input
                        type="file"
                        id="image"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                        disabled={isLoading}
                      />
                      <label
                        htmlFor="image"
                        className="absolute inset-0 bg-black/50 flex items-center justify-center text-white cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                      >
                        Đổi ảnh
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="employeeCode">Mã nhân viên</Label>
                        <Input
                          id="employeeCode"
                          value={updateStaffForm.employeeCode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setUpdateStaffForm("employeeCode", e.target.value)
                          }
                          onBlur={() =>
                            validateUpdateStaffField("employeeCode")
                          }
                          className={cn(
                            updateStaffFormErrors.employeeCode &&
                              "border-destructive",
                          )}
                          disabled={isLoading}
                        />
                        <div className="min-h-[20px]">
                          {updateStaffFormErrors.employeeCode && (
                            <p className="text-sm text-destructive">
                              {updateStaffFormErrors.employeeCode}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="name">Tên nhân viên</Label>
                        <Input
                          id="name"
                          value={updateStaffForm.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setUpdateStaffForm("name", e.target.value)
                          }
                          onBlur={() => validateUpdateStaffField("name")}
                          className={cn(
                            updateStaffFormErrors.name && "border-destructive",
                          )}
                          disabled={isLoading}
                        />
                        <div className="min-h-[20px]">
                          {updateStaffFormErrors.name && (
                            <p className="text-sm text-destructive">
                              {updateStaffFormErrors.name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phoneNumber">Số điện thoại</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={updateStaffForm.phoneNumber}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setUpdateStaffForm("phoneNumber", e.target.value)
                          }
                          onBlur={() => validateUpdateStaffField("phoneNumber")}
                          className={cn(
                            updateStaffFormErrors.phoneNumber &&
                              "border-destructive",
                          )}
                          disabled={isLoading}
                        />
                        <div className="min-h-[20px]">
                          {updateStaffFormErrors.phoneNumber && (
                            <p className="text-sm text-destructive">
                              {updateStaffFormErrors.phoneNumber}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={updateStaffForm.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setUpdateStaffForm("email", e.target.value)
                          }
                          onBlur={() => validateUpdateStaffField("email")}
                          className={cn(
                            updateStaffFormErrors.email && "border-destructive",
                          )}
                          disabled={isLoading}
                        />
                        <div className="min-h-[20px]">
                          {updateStaffFormErrors.email && (
                            <p className="text-sm text-destructive">
                              {updateStaffFormErrors.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="role">Chức vụ</Label>
                        <Select
                          value={updateStaffForm.role as string}
                          onValueChange={(value) =>
                            setUpdateStaffForm("role", value)
                          }
                          disabled={isLoading}
                        >
                          <SelectTrigger
                            id="role"
                            className={cn(
                              updateStaffFormErrors.role &&
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
                          {updateStaffFormErrors.role && (
                            <p className="text-sm text-destructive">
                              {updateStaffFormErrors.role}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                      <Textarea
                        id="note"
                        value={updateStaffForm.note || ""}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setUpdateStaffForm("note", e.target.value)
                        }
                        className="resize-none min-h-[120px]"
                        disabled={isLoading}
                        placeholder="Nhập thông tin thêm về nhân viên..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="info-display"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={containerVariants}
                className="px-6 space-y-6"
              >
                <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                  <div className="relative w-40 h-40 rounded-full overflow-hidden border bg-muted/30 shrink-0">
                    {imagePreviewUrl ? (
                      <Image
                        src={imagePreviewUrl}
                        fill
                        sizes="(max-width: 160px) 100vw, 160px"
                        className="object-cover"
                        alt={staff.name}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-muted">
                        <UserCog className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center md:items-start space-y-3 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-2">
                      <h3 className="font-bold text-xl">{staff.name}</h3>
                      <Badge
                        variant={getRoleBadgeVariant(staff.role)}
                        className="ml-0 md:ml-2"
                      >
                        {getRoleLabel(staff.role)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-8 rounded-full max-w-full overflow-hidden"
                        >
                          <User className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{staff.employeeCode}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-8 rounded-full max-w-full overflow-hidden"
                        >
                          <Phone className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{staff.phoneNumber}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-8 rounded-full max-w-full overflow-hidden"
                        >
                          <Mail className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{staff.email}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-8 rounded-full max-w-full overflow-hidden"
                        >
                          <Calendar className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {formatDate(staff.birthday)}
                          </span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="h-8 rounded-full max-w-full overflow-hidden"
                        >
                          <Users className="mr-1 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">
                            {getGenderLabel(staff.gender)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {staff.note && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      Ghi chú
                    </p>
                    <p className="text-sm whitespace-pre-line">{staff.note}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <DialogFooter className="mt-auto pt-4 border-t">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isLoading}
                  className="mr-2"
                >
                  <X className="h-4 w-4 mr-2" /> Hủy
                </Button>
                <Button
                  type="submit"
                  onClick={handleSaveChanges}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" /> Lưu
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleting(true)}
                  className="mr-2"
                >
                  <Trash className="h-4 w-4 mr-2" /> Xóa
                </Button>
                <Button type="button" onClick={handleEditToggle}>
                  <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhân viên {staff.name}? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteStaff}
              className="bg-destructive hover:bg-destructive/90 text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
