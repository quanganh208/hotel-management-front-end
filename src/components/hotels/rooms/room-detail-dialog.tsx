import { useEffect, useState } from "react";
import { Edit, Loader2, Trash } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RoomWithType } from "@/types/room";
import { useRoomStore } from "@/store/rooms";
import { useRoomCategoryStore } from "@/store/room-categories";

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
  RoomInfoTab,
  BookingHistoryTab,
  TransactionHistoryTab,
  CleaningHistoryTab,
  RoomFormEdit,
} from "./room-detail-tabs";

interface RoomDetailDialogProps {
  room: RoomWithType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoomDetailDialog({
  room,
  open,
  onOpenChange,
}: RoomDetailDialogProps) {
  const params = useParams();
  const hotelId = params.id as string;

  const [activeTab, setActiveTab] = useState("information");
  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const {
    updateRoomForm,
    updateRoomFormErrors,
    isLoading,
    error,
    success,
    setUpdateRoomForm,
    validateUpdateRoomField,
    updateRoom,
    deleteRoom,
    resetUpdateRoomForm,
    setUpdateFormFromRoom,
    resetMessages,
  } = useRoomStore();

  const {
    roomCategories,
    fetchRoomCategories,
    isFetching: isFetchingCategories,
  } = useRoomCategoryStore();

  // Lọc danh sách hạng phòng cho khách sạn hiện tại
  const filteredCategories = roomCategories.filter(
    (category) => category.hotelId === hotelId,
  );

  // Load dữ liệu khi dialog mở
  useEffect(() => {
    if (open) {
      fetchRoomCategories(hotelId);
      setUpdateFormFromRoom(room);
    } else {
      setIsEditMode(false);
      resetUpdateRoomForm();
      resetMessages();
    }
  }, [
    open,
    hotelId,
    room,
    fetchRoomCategories,
    setUpdateFormFromRoom,
    resetUpdateRoomForm,
    resetMessages,
  ]);

  // Theo dõi và đóng dialog khi cập nhật thành công
  useEffect(() => {
    if (success && isEditMode) {
      setIsEditMode(false);
      resetUpdateRoomForm();
      // Đóng dialog khi cập nhật thành công
      onOpenChange(false);
    }
  }, [success, isEditMode, resetUpdateRoomForm, onOpenChange]);

  // Cập nhật URL preview khi hình ảnh thay đổi
  useEffect(() => {
    if (updateRoomForm.image) {
      const url = URL.createObjectURL(updateRoomForm.image as File);
      setImagePreviewUrl(url);

      // Cleanup function để giải phóng URL khi component unmount hoặc ảnh thay đổi
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (room.image) {
      setImagePreviewUrl(room.image);
    } else {
      setImagePreviewUrl(null);
    }
  }, [updateRoomForm.image, room.image]);

  const handleSave = async () => {
    if (!room._id) return;

    await updateRoom(room._id);
  };

  const handleUpdate = () => {
    setIsEditMode(true);
    setUpdateFormFromRoom(room);
  };

  const handleDelete = async () => {
    await deleteRoom(room._id);
    onOpenChange(false);
  };

  // Xử lý khi thành công hoặc lỗi
  useEffect(() => {
    if (error) {
      resetMessages();
    }
  }, [error, resetMessages]);

  return (
    <>
      <Dialog open={open} onOpenChange={isEditMode ? undefined : onOpenChange}>
        <DialogContent
          className={`sm:max-w-[800px] h-[640px] overflow-hidden flex flex-col ${
            isEditMode ? "[&>button]:hidden" : ""
          }`}
        >
          <DialogHeader>
            <DialogTitle>
              Phòng {room.roomNumber} - Tầng {room.floor}
            </DialogTitle>
          </DialogHeader>

          {isEditMode ? (
            <div className="flex-1 overflow-y-auto">
              <RoomFormEdit
                room={room}
                imagePreviewUrl={imagePreviewUrl}
                updateRoomForm={updateRoomForm}
                updateRoomFormErrors={updateRoomFormErrors}
                filteredCategories={filteredCategories}
                isFetchingCategories={isFetchingCategories}
                isLoading={isLoading}
                setUpdateRoomForm={setUpdateRoomForm}
                validateUpdateRoomField={validateUpdateRoomField}
                setIsEditing={setIsEditMode}
                handleSubmit={(e) => {
                  e.preventDefault();
                  return handleSave();
                }}
              />
            </div>
          ) : (
            <Tabs
              defaultValue="information"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="information">Thông tin</TabsTrigger>
                <TabsTrigger value="bookings">Lịch sử đặt phòng</TabsTrigger>
                <TabsTrigger value="transactions">
                  Lịch sử giao dịch
                </TabsTrigger>
                <TabsTrigger value="cleaning">Lịch sử dọn phòng</TabsTrigger>
              </TabsList>

              <TabsContent
                value="information"
                className="p-4 flex-1 overflow-y-auto"
              >
                <RoomInfoTab room={room} imagePreviewUrl={imagePreviewUrl} />
              </TabsContent>

              <TabsContent
                value="bookings"
                className="p-4 flex-1 overflow-y-auto"
              >
                <BookingHistoryTab />
              </TabsContent>

              <TabsContent
                value="transactions"
                className="p-4 flex-1 overflow-y-auto"
              >
                <TransactionHistoryTab />
              </TabsContent>

              <TabsContent
                value="cleaning"
                className="p-4 flex-1 overflow-y-auto"
              >
                <CleaningHistoryTab />
              </TabsContent>
            </Tabs>
          )}

          {!isEditMode && (
            <DialogFooter className="mt-auto pt-4 border-t">
              <Button
                variant="destructive"
                onClick={() => setConfirmDelete(true)}
                className="mr-2"
              >
                <Trash className="h-4 w-4 mr-2" /> Xóa
              </Button>
              <Button type="button" onClick={handleUpdate}>
                <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa phòng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phòng {room.roomNumber} - Tầng{" "}
              {room.floor}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
