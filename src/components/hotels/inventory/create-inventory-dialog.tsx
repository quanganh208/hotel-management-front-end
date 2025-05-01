import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Package,
  ImageIcon,
  DollarSign,
  Tag,
  Box,
  Info,
} from "lucide-react";
import { useInventoryStore } from "@/store";
import { toast } from "sonner";
import { ItemType } from "@/types/inventory";

interface CreateInventoryDialogProps {
  hotelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

export function CreateInventoryDialog({
  hotelId,
  open,
  onOpenChange,
}: CreateInventoryDialogProps) {
  const { fetchInventory, createInventory } = useInventoryStore();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Form states
  const [form, setForm] = useState({
    name: "",
    unit: "cái", // Đơn vị mặc định
    sellingPrice: "",
    costPrice: "",
    stock: "",
    itemType: "" as ItemType | "",
    description: "",
    image: null as File | null,
  });

  const [formErrors, setFormErrors] = useState({
    name: "",
    unit: "",
    sellingPrice: "",
    costPrice: "",
    stock: "",
    itemType: "",
    image: "",
  });

  // Reset form khi dialog đóng/mở
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (form.image) {
      const url = URL.createObjectURL(form.image);
      setImagePreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [form.image]);

  const resetForm = () => {
    setForm({
      name: "",
      unit: "cái",
      sellingPrice: "",
      costPrice: "",
      stock: "",
      itemType: "",
      description: "",
      image: null,
    });
    setFormErrors({
      name: "",
      unit: "",
      sellingPrice: "",
      costPrice: "",
      stock: "",
      itemType: "",
      image: "",
    });
    setImagePreviewUrl(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Kiểm tra kích thước file
      if (file.size > MAX_FILE_SIZE) {
        setFormErrors({
          ...formErrors,
          image: `File quá lớn (${formatFileSize(file.size)}). Kích thước tối đa là ${formatFileSize(MAX_FILE_SIZE)}.`,
        });
        e.target.value = ""; // Reset input file
        return;
      }

      // Xác thực loại tệp
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setFormErrors({
          ...formErrors,
          image: "Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WEBP.",
        });
        e.target.value = ""; // Reset input file
        return;
      }

      // Nếu hợp lệ, cập nhật state
      setForm({
        ...form,
        image: file,
      });
      setFormErrors({
        ...formErrors,
        image: "",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof typeof form,
  ) => {
    setForm({
      ...form,
      [field]: e.target.value,
    });

    // Clear error when user types
    if (formErrors[field as keyof typeof formErrors]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "sellingPrice" | "costPrice" | "stock",
  ) => {
    const value = e.target.value;
    // Cho phép giá trị trống để người dùng có thể xóa và nhập lại
    if (value === "") {
      setForm({
        ...form,
        [field]: value,
      });
    } else {
      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
        setForm({
          ...form,
          [field]: field === "stock" ? Math.floor(Number(value)) : value,
        });
      }
    }

    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };

  const handleSelectChange = (value: string, field: "itemType" | "unit") => {
    setForm({
      ...form,
      [field]: value,
    });

    // Clear error when user selects
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = { ...formErrors };
    let valid = true;

    // Validate required fields
    if (!form.name.trim()) {
      newErrors.name = "Tên hàng hoá không được để trống";
      valid = false;
    }

    if (!form.unit.trim()) {
      newErrors.unit = "Đơn vị không được để trống";
      valid = false;
    }

    if (!form.sellingPrice) {
      newErrors.sellingPrice = "Giá bán không được để trống";
      valid = false;
    } else if (Number(form.sellingPrice) < 0) {
      newErrors.sellingPrice = "Giá bán không được âm";
      valid = false;
    }

    if (!form.costPrice) {
      newErrors.costPrice = "Giá vốn không được để trống";
      valid = false;
    } else if (Number(form.costPrice) < 0) {
      newErrors.costPrice = "Giá vốn không được âm";
      valid = false;
    }

    if (!form.stock) {
      newErrors.stock = "Số lượng tồn kho không được để trống";
      valid = false;
    } else if (Number(form.stock) < 0) {
      newErrors.stock = "Số lượng tồn kho không được âm";
      valid = false;
    }

    if (!form.itemType) {
      newErrors.itemType = "Vui lòng chọn loại hàng hoá";
      valid = false;
    }

    setFormErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Dữ liệu để gửi lên API
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("unit", form.unit);
    formData.append("sellingPrice", String(form.sellingPrice));
    formData.append("costPrice", String(form.costPrice));
    formData.append("stock", String(form.stock));
    formData.append("itemType", form.itemType);
    formData.append("hotelId", hotelId);

    if (form.description) {
      formData.append("description", form.description);
    }

    if (form.image) {
      formData.append("image", form.image);
    }

    try {
      await createInventory(formData);
      toast.success("Thêm hàng hoá thành công");
      onOpenChange(false);

      // Reload dữ liệu
      fetchInventory(hotelId);
    } catch (error) {
      console.error("Lỗi khi thêm hàng hoá:", error);
      toast.error("Thêm hàng hoá thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Thêm hàng hoá mới
          </DialogTitle>
          <DialogDescription>
            Nhập thông tin đầy đủ để thêm mới hàng hoá vào danh mục
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên hàng hoá */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-muted-foreground" />
                Tên hàng hoá <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="VD: Nước suối"
                value={form.name}
                onChange={(e) => handleInputChange(e, "name")}
                className={formErrors.name ? "border-destructive" : ""}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>

            {/* Đơn vị */}
            <div className="space-y-2">
              <Label htmlFor="unit" className="flex items-center gap-1">
                <Box className="h-4 w-4 text-muted-foreground" />
                Đơn vị <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.unit}
                onValueChange={(value) => handleSelectChange(value, "unit")}
              >
                <SelectTrigger
                  className={formErrors.unit ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Chọn đơn vị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chai">Chai</SelectItem>
                  <SelectItem value="lon">Lon</SelectItem>
                  <SelectItem value="hộp">Hộp</SelectItem>
                  <SelectItem value="gói">Gói</SelectItem>
                  <SelectItem value="cái">Cái</SelectItem>
                  <SelectItem value="bộ">Bộ</SelectItem>
                  <SelectItem value="kg">Kg</SelectItem>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="lít">Lít</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.unit && (
                <p className="text-xs text-destructive">{formErrors.unit}</p>
              )}
            </div>

            {/* Loại hàng hoá */}
            <div className="space-y-2">
              <Label htmlFor="itemType" className="flex items-center gap-1">
                <Package className="h-4 w-4 text-muted-foreground" />
                Loại hàng hoá <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.itemType}
                onValueChange={(value) =>
                  handleSelectChange(value as ItemType, "itemType")
                }
              >
                <SelectTrigger
                  className={formErrors.itemType ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Chọn loại hàng hoá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beverage">Đồ uống</SelectItem>
                  <SelectItem value="food">Thức ăn</SelectItem>
                  <SelectItem value="amenity">Tiện nghi</SelectItem>
                  <SelectItem value="equipment">Thiết bị</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.itemType && (
                <p className="text-xs text-destructive">
                  {formErrors.itemType}
                </p>
              )}
            </div>

            {/* Giá bán */}
            <div className="space-y-2">
              <Label htmlFor="sellingPrice" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Giá bán (VNĐ) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="sellingPrice"
                type="number"
                placeholder="VD: 15000"
                value={form.sellingPrice}
                onChange={(e) => handleNumberInputChange(e, "sellingPrice")}
                className={formErrors.sellingPrice ? "border-destructive" : ""}
              />
              {formErrors.sellingPrice && (
                <p className="text-xs text-destructive">
                  {formErrors.sellingPrice}
                </p>
              )}
            </div>

            {/* Giá vốn */}
            <div className="space-y-2">
              <Label htmlFor="costPrice" className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Giá vốn (VNĐ) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="costPrice"
                type="number"
                placeholder="VD: 10000"
                value={form.costPrice}
                onChange={(e) => handleNumberInputChange(e, "costPrice")}
                className={formErrors.costPrice ? "border-destructive" : ""}
              />
              {formErrors.costPrice && (
                <p className="text-xs text-destructive">
                  {formErrors.costPrice}
                </p>
              )}
            </div>

            {/* Số lượng tồn kho ban đầu */}
            <div className="space-y-2">
              <Label htmlFor="stock" className="flex items-center gap-1">
                <Box className="h-4 w-4 text-muted-foreground" />
                Tồn kho ban đầu <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="VD: 100"
                value={form.stock}
                onChange={(e) => handleNumberInputChange(e, "stock")}
                className={formErrors.stock ? "border-destructive" : ""}
              />
              {formErrors.stock && (
                <p className="text-xs text-destructive">{formErrors.stock}</p>
              )}
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-1">
              <Info className="h-4 w-4 text-muted-foreground" />
              Mô tả
            </Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả chi tiết về hàng hoá"
              value={form.description}
              onChange={(e) => handleInputChange(e, "description")}
              rows={3}
            />
          </div>

          {/* Hình ảnh */}
          <div className="space-y-2">
            <Label htmlFor="image" className="flex items-center gap-1">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              Hình ảnh
            </Label>
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className="relative w-40 h-40 rounded-md border overflow-hidden bg-muted/30 flex-shrink-0">
                {imagePreviewUrl ? (
                  <Image
                    src={imagePreviewUrl}
                    alt="Hình ảnh sản phẩm"
                    fill
                    className="object-cover"
                    sizes="(max-width: 160px) 100vw, 160px"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Input
                  id="image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className={formErrors.image ? "border-destructive" : ""}
                />
                {formErrors.image ? (
                  <p className="text-xs text-destructive">{formErrors.image}</p>
                ) : (
                  form.image && (
                    <p className="text-xs text-muted-foreground">
                      Kích thước file: {formatFileSize(form.image.size)}
                    </p>
                  )
                )}
                <p className="text-xs text-muted-foreground">
                  Chấp nhận ảnh JPG, PNG, GIF hoặc WEBP dưới 10MB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Thêm hàng hoá"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
