import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash, Save, X, Loader2, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";

// Import local components
import { ProductDetailsTab } from "./product-details-tab";
import { ProductStatsTab } from "./product-stats-tab";
import { ProductHistoryTab } from "./product-history-tab";
import { ProductEditForm } from "./product-edit-form";

// Import types, utilities and store
import {
  Product,
  UpdateProductForm,
  ProductFormErrors,
  UpdateHistoryItem,
  ItemType,
} from "./types";
import { MAX_FILE_SIZE, validateProductForm } from "./utils";
import { useInventoryStore } from "@/store";

interface ProductDetailDialogProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDialog({
  product,
  open,
  onOpenChange,
}: ProductDetailDialogProps) {
  const params = useParams();
  const hotelId = params?.id as string;
  const { updateInventory, deleteInventory } = useInventoryStore();

  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  // Form states
  const [updateProductForm, setUpdateProductForm] = useState<UpdateProductForm>(
    {
      inventoryCode: "",
      name: "",
      sellingPrice: 0,
      costPrice: 0,
      stockQuantity: 0,
      description: "",
      itemType: "other" as ItemType,
      unit: "",
      image: null,
    },
  );

  const [formErrors, setFormErrors] = useState<ProductFormErrors>({
    inventoryCode: "",
    name: "",
    sellingPrice: "",
    costPrice: "",
    stockQuantity: "",
    itemType: "",
    unit: "",
    image: "",
  });

  // Mock update history data
  const updateHistory: UpdateHistoryItem[] = [
    {
      date: "2025-03-15",
      action: "Cập nhật giá",
      user: "Nguyễn Văn A",
      details: "Giá bán: 20.000đ -> 25.000đ",
    },
    {
      date: "2025-02-20",
      action: "Nhập hàng",
      user: "Trần Thị B",
      details: "Số lượng: +30",
    },
    {
      date: "2025-01-05",
      action: "Tạo mới",
      user: "Lê Văn C",
      details: "Tạo sản phẩm mới",
    },
  ];

  // Initialize form when dialog opens
  useEffect(() => {
    if (open && product) {
      setUpdateProductForm({
        inventoryCode: product.inventoryCode || "",
        name: product.name || "",
        sellingPrice: product.sellingPrice || 0,
        costPrice: product.costPrice || 0,
        stockQuantity: product.stock || 0,
        description: product.description || "",
        itemType: product.itemType || "other",
        unit: product.unit || "",
        image: null,
      });
      setImagePreviewUrl(product.image || null);
      setIsImageChanged(false);
      setIsEditing(false);
      setActiveTab("details");
      setFormErrors((prev) => ({ ...prev, image: "" }));
    }
  }, [open, product]);

  // Update image preview when image changes
  useEffect(() => {
    if (updateProductForm.image && isImageChanged) {
      const url = URL.createObjectURL(updateProductForm.image);
      setImagePreviewUrl(url);

      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [updateProductForm.image, isImageChanged]);

  const handleClose = () => {
    setIsEditing(false);
    setIsDeleting(false);
    onOpenChange(false);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original data
      setUpdateProductForm({
        inventoryCode: product.inventoryCode,
        name: product.name,
        sellingPrice: product.sellingPrice,
        costPrice: product.costPrice,
        stockQuantity: product.stock,
        description: product.description || "",
        itemType: product.itemType,
        unit: product.unit || "",
        image: null,
      });
      setImagePreviewUrl(product.image || null);
      setIsImageChanged(false);
      setFormErrors((prev) => ({ ...prev, image: "" }));
    }
    setIsEditing(!isEditing);
  };

  const handleFormChange = (
    field: keyof UpdateProductForm,
    value: string | number | File | null,
  ) => {
    setUpdateProductForm({
      ...updateProductForm,
      [field]: value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        const errorMsg = `File quá lớn. Kích thước tối đa là 10MB.`;
        setFormErrors((prev) => ({ ...prev, image: errorMsg }));
        e.target.value = ""; // Reset input
        return;
      }

      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!validTypes.includes(file.type)) {
        const errorMsg = "Chỉ chấp nhận file ảnh JPG, PNG, GIF hoặc WEBP.";
        setFormErrors((prev) => ({ ...prev, image: errorMsg }));
        e.target.value = ""; // Reset input
        return;
      }

      // Update form if valid
      setUpdateProductForm({
        ...updateProductForm,
        image: file,
      });
      setIsImageChanged(true);
      setFormErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "sellingPrice" | "costPrice" | "stockQuantity",
  ) => {
    const value = e.target.value;
    // Allow empty value for user to clear and retype
    if (value === "") {
      setUpdateProductForm({
        ...updateProductForm,
        [field]: value,
      });
    } else {
      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
        setUpdateProductForm({
          ...updateProductForm,
          [field]:
            field === "stockQuantity" ? Math.floor(numberValue) : numberValue,
        });
      }
    }
  };

  const handleSelectChange = (value: string, field: "itemType" | "unit") => {
    setUpdateProductForm({
      ...updateProductForm,
      [field]: value,
    });
  };

  const handleSaveChanges = async () => {
    if (
      !validateProductForm(updateProductForm, setFormErrors, formErrors.image)
    ) {
      return;
    }

    setIsLoading(true);

    // Create FormData for API call
    const formData = new FormData();
    formData.append("inventoryCode", updateProductForm.inventoryCode);
    formData.append("name", updateProductForm.name);
    formData.append("sellingPrice", updateProductForm.sellingPrice.toString());
    formData.append("costPrice", updateProductForm.costPrice.toString());
    formData.append("stock", updateProductForm.stockQuantity.toString());

    if (updateProductForm.description) {
      formData.append("description", updateProductForm.description);
    }

    formData.append("itemType", updateProductForm.itemType);
    formData.append("unit", updateProductForm.unit);
    formData.append("hotelId", hotelId);

    if (updateProductForm.image) {
      formData.append("image", updateProductForm.image);
    }

    try {
      await updateInventory(product._id, formData);
      setIsLoading(false);
      setIsEditing(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating product:", error);
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    setIsLoading(true);

    try {
      await deleteInventory(product._id, hotelId);
      setIsLoading(false);
      setIsDeleting(false);
      handleClose();
    } catch (error) {
      console.error("Error deleting product:", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className={`sm:max-w-[750px] max-h-[90vh] overflow-y-auto ${
            isEditing ? "[&>button]:hidden" : ""
          }`}
        >
          <DialogHeader className="px-6 pb-0 sticky top-0 bg-background">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Edit className="h-5 w-5 text-muted-foreground" />
                      Chỉnh sửa thông tin hàng hóa
                    </>
                  ) : (
                    <>
                      <Package className="h-5 w-5 text-primary" />
                      <span className="truncate max-w-[300px]">
                        {product.name}
                      </span>
                    </>
                  )}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  {isEditing ? (
                    "Cập nhật thông tin hàng hóa trong form bên dưới"
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-primary">
                        {product.inventoryCode}
                      </span>
                      {product.itemType && (
                        <Badge variant="outline" className="ml-2">
                          {getItemTypeLabel(product.itemType)}
                        </Badge>
                      )}
                    </div>
                  )}
                </DialogDescription>
              </div>
            </motion.div>
          </DialogHeader>

          {isEditing ? (
            <ProductEditForm
              updateProductForm={updateProductForm}
              formErrors={formErrors}
              imagePreviewUrl={imagePreviewUrl}
              onFormChange={handleFormChange}
              onImageChange={handleImageChange}
              onNumberInputChange={handleNumberInputChange}
              onSelectChange={handleSelectChange}
            />
          ) : (
            <div className="px-6 pb-2">
              <Tabs
                defaultValue="details"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="w-full bg-muted/50 rounded-lg grid grid-cols-3">
                  <TabsTrigger
                    value="details"
                    className="flex gap-1.5 items-center"
                  >
                    <span className="hidden sm:inline">Thông tin</span>
                    <span className="sm:hidden">Thông tin</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="stats"
                    className="flex gap-1.5 items-center"
                  >
                    <span className="hidden sm:inline">Thống kê</span>
                    <span className="sm:hidden">Thống kê</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="flex gap-1.5 items-center"
                  >
                    <span className="hidden sm:inline">Lịch sử</span>
                    <span className="sm:hidden">Lịch sử</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="pt-4">
                  <ProductDetailsTab
                    product={product}
                    imagePreviewUrl={imagePreviewUrl}
                  />
                </TabsContent>

                <TabsContent value="stats" className="pt-4">
                  <ProductStatsTab product={product} />
                </TabsContent>

                <TabsContent value="history" className="pt-4">
                  <ProductHistoryTab updateHistory={updateHistory} />
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="mt-auto pt-4 px-6 border-t sticky bottom-0 bg-background z-10">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleEditToggle}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" /> Hủy
                </Button>
                <Button
                  type="button"
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
            <AlertDialogTitle>Xác nhận xóa hàng hóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa hàng hóa {product.name}? Hành động này
              không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
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

// Helper function to map itemType to human-readable labels
function getItemTypeLabel(itemType: string): string {
  const typeMap: Record<string, string> = {
    beverage: "Đồ uống",
    food: "Thức ăn",
    amenity: "Tiện nghi",
    equipment: "Thiết bị",
    other: "Khác",
  };

  return typeMap[itemType] || itemType;
}
