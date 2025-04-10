import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { RoomCategory } from "@/types/room";
import { useRoomCategoryStore } from "@/store/room-categories";
import { Edit, Trash, Save, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Nhập các components từ folder tabs
import {
  InformationTab,
  RoomsTab,
  EditForm,
  DeleteDialog,
} from "./room-category-tabs";

interface RoomCategoryDetailProps {
  category: RoomCategory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomCategoryDetailDialog({
  category,
  open,
  onOpenChange,
}: RoomCategoryDetailProps) {
  const params = useParams();
  const hotelId = params.id as string;

  const [activeTab, setActiveTab] = useState("information");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const {
    getRoomsByCategory,
    deleteRoomCategory,
    updateRoomCategory,
    success,
    resetUpdateRoomCategoryForm,
    setUpdateFormFromCategory,
  } = useRoomCategoryStore();

  const rooms = getRoomsByCategory(category._id);

  // Khởi tạo form từ category khi component mount hoặc category thay đổi
  useEffect(() => {
    if (category) {
      setUpdateFormFromCategory(category);
    }
  }, [category, setUpdateFormFromCategory]);

  // Theo dõi và đóng dialog khi cập nhật thành công
  useEffect(() => {
    if (success && isEditMode) {
      setIsEditMode(false);
      setIsSaving(false);
      resetUpdateRoomCategoryForm();
      // Đóng dialog khi cập nhật thành công
      onOpenChange(false);
    }
  }, [success, isEditMode, resetUpdateRoomCategoryForm, onOpenChange]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreviewUrl(url);

      // Cleanup function để giải phóng URL khi component unmount hoặc ảnh thay đổi
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setImagePreviewUrl(null);
    }
  }, [imageFile]);

  const handleUpdate = () => {
    setIsEditMode(true);
    setUpdateFormFromCategory(category);
  };

  const handleSave = async () => {
    if (!category._id) return;

    setIsSaving(true);
    const result = await updateRoomCategory(category._id, hotelId);
    if (!result) {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setImageFile(null);
    resetUpdateRoomCategoryForm();
  };

  const handleDeleteClick = () => {
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!category._id) return;

    setIsDeleting(true);

    try {
      // Gọi API xóa và nhận kết quả
      const result = await deleteRoomCategory(category._id);

      // Nếu thành công, đóng dialog
      if (result) {
        setIsDeleteOpen(false);
        onOpenChange(false);
      }
    } catch (err) {
      console.error("Lỗi khi xóa hạng phòng:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={isEditMode ? undefined : onOpenChange}>
        <DialogContent
          className={`sm:max-w-[800px] h-[600px] overflow-hidden flex flex-col ${
            isEditMode ? "[&>button]:hidden" : ""
          }`}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col h-full"
          >
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isEditMode ? "Cập nhật hạng phòng" : category.name}
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              {isEditMode ? (
                // Chế độ chỉnh sửa
                <EditForm
                  category={category}
                  imageFile={imageFile}
                  setImageFile={setImageFile}
                  imagePreviewUrl={imagePreviewUrl}
                />
              ) : (
                // Chế độ xem
                <Tabs
                  key="view-mode-tabs"
                  defaultValue="information"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full flex-1 flex flex-col overflow-hidden"
                >
                  <TabsList className="w-full flex">
                    <TabsTrigger value="information" className="w-full flex-1">
                      Thông tin
                    </TabsTrigger>
                    <TabsTrigger value="rooms" className="w-full flex-1">
                      Danh sách phòng
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    key="information-content"
                    value="information"
                    className="p-4 flex-1 overflow-y-auto"
                  >
                    <InformationTab category={category} />
                  </TabsContent>

                  <TabsContent
                    key="rooms-content"
                    value="rooms"
                    className="p-4 flex-1 overflow-y-auto"
                  >
                    <RoomsTab rooms={rooms} />
                  </TabsContent>
                </Tabs>
              )}
            </div>

            <DialogFooter className="mt-auto pt-4 border-t sticky bottom-0 bg-background z-10">
              {isEditMode ? (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      className="mr-2"
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-2" /> Hủy
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? (
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
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      className="mr-2"
                    >
                      <Trash className="h-4 w-4 mr-2" /> Xóa
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button type="button" onClick={handleUpdate}>
                      <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                    </Button>
                  </motion.div>
                </>
              )}
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        category={category}
        isOpen={isDeleteOpen}
        isDeleting={isDeleting}
        onOpenChange={setIsDeleteOpen}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}
