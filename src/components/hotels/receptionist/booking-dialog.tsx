import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RoomWithType } from "@/types/room";
import { Badge } from "@/components/ui/badge";
import { RoomStatus } from "@/types/room";
import { cn } from "@/lib/utils";
import { useBookingStore } from "@/store/booking";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: RoomWithType[];
  onBookingSuccess?: () => void; // Thêm callback khi đặt phòng thành công
}

export function BookingDialog({
  open,
  onOpenChange,
  rooms,
  onBookingSuccess,
}: BookingDialogProps) {
  // Truy cập store đặt phòng
  const {
    bookingForm,
    bookingFormErrors,
    setBookingForm,
    isLoading,
    createBooking,
    resetBookingForm,
  } = useBookingStore();

  // Lọc chỉ phòng trống
  const availableRooms = rooms.filter(
    (room) => room.status === RoomStatus.AVAILABLE
  );

  // Hàm xử lý khi submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Cập nhật giá trị form từ state component vào store
    const success = await createBooking();

    if (success) {
      onOpenChange(false);
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    }
  };

  // Reset form khi dialog đóng
  useEffect(() => {
    if (!open) {
      resetBookingForm();
    }
  }, [open, resetBookingForm]);

  // Hàm xử lý khi thay đổi giá trị input
  const handleInputChange = (
    field: keyof typeof bookingForm,
    value: string | number
  ) => {
    setBookingForm(field, value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Đặt phòng mới</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div>
            <Label>
              Chọn phòng <span className="text-destructive">*</span>
            </Label>
            <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableRooms.length === 0 ? (
                <div className="p-2 text-center text-muted-foreground text-sm border rounded-md bg-muted/40">
                  Không còn phòng nào trống
                </div>
              ) : (
                availableRooms.map((room) => (
                  <label
                    key={room._id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                      bookingForm.roomId === room._id
                        ? "border-primary bg-primary/5 ring-2 ring-primary"
                        : "border-muted bg-background hover:bg-muted/40"
                    )}
                  >
                    <input
                      type="radio"
                      name="roomId"
                      value={room._id}
                      checked={bookingForm.roomId === room._id}
                      onChange={() => handleInputChange("roomId", room._id)}
                      className="accent-primary h-4 w-4"
                    />
                    <div className="flex flex-col gap-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">
                          Phòng {room.roomNumber}
                        </span>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-200 px-2 py-0.5 text-xs"
                        >
                          Trống
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Tầng {room.floor}</span>
                        <span>•</span>
                        <span>{room.roomTypeId?.name}</span>
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
            {bookingFormErrors.roomId && (
              <p className="text-sm text-destructive mt-1">
                {bookingFormErrors.roomId}
              </p>
            )}
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/30">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Thời gian nhận - trả phòng quy định
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-1 text-blue-700 dark:text-blue-300">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Cả ngày tính từ 14:00 đến 12:00</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span>Qua đêm tính từ 22:00 đến 11:00</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label>
                Ngày nhận phòng <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={bookingForm.checkInDate}
                onChange={(e) =>
                  handleInputChange("checkInDate", e.target.value)
                }
              />
              {bookingFormErrors.checkInDate && (
                <p className="text-sm text-destructive mt-1">
                  {bookingFormErrors.checkInDate}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label>
                Ngày trả phòng <span className="text-destructive">*</span>
              </Label>
              <Input
                type="datetime-local"
                value={bookingForm.checkOutDate}
                onChange={(e) =>
                  handleInputChange("checkOutDate", e.target.value)
                }
              />
              {bookingFormErrors.checkOutDate && (
                <p className="text-sm text-destructive mt-1">
                  {bookingFormErrors.checkOutDate}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label>
              Tên khách <span className="text-destructive">*</span>
            </Label>
            <Input
              value={bookingForm.guestName}
              onChange={(e) => handleInputChange("guestName", e.target.value)}
            />
            {bookingFormErrors.guestName && (
              <p className="text-sm text-destructive mt-1">
                {bookingFormErrors.guestName}
              </p>
            )}
          </div>
          <div>
            <Label>
              Số điện thoại <span className="text-destructive">*</span>
            </Label>
            <Input
              value={bookingForm.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
            />
            {bookingFormErrors.phoneNumber && (
              <p className="text-sm text-destructive mt-1">
                {bookingFormErrors.phoneNumber}
              </p>
            )}
          </div>
          <div>
            <Label>
              Số lượng khách <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min={1}
              value={bookingForm.guestCount}
              onChange={(e) =>
                handleInputChange("guestCount", Number(e.target.value))
              }
            />
            {bookingFormErrors.guestCount && (
              <p className="text-sm text-destructive mt-1">
                {bookingFormErrors.guestCount}
              </p>
            )}
          </div>
          <div>
            <Label>Ghi chú</Label>
            <Textarea
              value={bookingForm.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              rows={2}
              placeholder="Ghi chú thêm (nếu có)"
            />
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Đang đặt phòng..." : "Xác nhận đặt phòng"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
