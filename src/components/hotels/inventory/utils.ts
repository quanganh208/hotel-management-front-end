import { toast } from "sonner";
import { UpdateProductForm, ProductFormErrors } from "./types";

// Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Format file size display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Validation function for the product form
export const validateProductForm = (
  form: UpdateProductForm,
  setErrors: React.Dispatch<React.SetStateAction<ProductFormErrors>>,
  currentImageError: string,
): boolean => {
  let valid = true;
  const errors = {
    inventoryCode: "",
    name: "",
    sellingPrice: "",
    costPrice: "",
    stockQuantity: "",
    itemType: "",
    unit: "",
    image: currentImageError, // Preserve existing image error
  };

  if (!form.inventoryCode.trim()) {
    errors.inventoryCode = "Mã hàng hóa không được để trống";
    valid = false;
  }

  if (!form.name.trim()) {
    errors.name = "Tên hàng hóa không được để trống";
    valid = false;
  }

  if (typeof form.sellingPrice !== "number" || form.sellingPrice < 0) {
    errors.sellingPrice = "Giá bán phải là số dương";
    valid = false;
  }

  if (typeof form.costPrice !== "number" || form.costPrice < 0) {
    errors.costPrice = "Giá vốn phải là số dương";
    valid = false;
  }

  if (typeof form.stockQuantity !== "number" || form.stockQuantity < 0) {
    errors.stockQuantity = "Số lượng tồn kho phải là số dương";
    valid = false;
  }

  if (!form.itemType) {
    errors.itemType = "Loại hàng hóa không được để trống";
    valid = false;
  }

  if (!form.unit) {
    errors.unit = "Đơn vị không được để trống";
    valid = false;
  }

  setErrors(errors);
  return valid;
};

// Mock API call function for updating product
export const mockUpdateProduct = (
  productId: string,
  formData: FormData,
  onSuccess: () => void,
  onError: () => void,
) => {
  // Simulate API call with timeout
  setTimeout(() => {
    try {
      // Simulate successful update
      toast.success("Cập nhật hàng hóa thành công");
      onSuccess();
    } catch (error) {
      toast.error("Cập nhật hàng hóa thất bại");
      onError();
      console.error("Error updating product:", error);
    }
  }, 1000);
};

// Mock API call function for deleting product
export const mockDeleteProduct = (
  productId: string,
  onSuccess: () => void,
  onError: () => void,
) => {
  // Simulate API call with timeout
  setTimeout(() => {
    try {
      // Simulate successful delete
      toast.success("Xóa hàng hóa thành công");
      onSuccess();
    } catch (error) {
      toast.error("Xóa hàng hóa thất bại");
      onError();
      console.error("Error deleting product:", error);
    }
  }, 1000);
};
