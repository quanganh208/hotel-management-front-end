import { Loader2, CheckSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { BookingDetail } from "@/types/room";

interface CheckInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomNumber: string;
  booking: BookingDetail | null;
  isWalkInGuest: boolean;
  walkInGuestForm: {
    guestName: string;
    phoneNumber: string;
    guestCount: number;
    checkInDate: string;
    checkOutDate: string;
    note: string;
  };
  checkInNote: string;
  isCheckingIn: boolean;
  onWalkInGuestFormChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onCheckInNoteChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CheckInDialog({
  open,
  onOpenChange,
  roomNumber,
  booking,
  isWalkInGuest,
  walkInGuestForm,
  checkInNote,
  isCheckingIn,
  onWalkInGuestFormChange,
  onCheckInNoteChange,
  onConfirm,
  onCancel,
}: CheckInDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isWalkInGuest ? "Nhận phòng trực tiếp" : "Xác nhận nhận phòng"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isWalkInGuest
              ? `Nhập thông tin khách vãng lai cho phòng ${roomNumber}`
              : `Xác nhận nhận phòng ${roomNumber} cho khách hàng ${
                  booking?.guestName || ""
                }?`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="py-2">
          {isWalkInGuest ? (
            <>
              <Label htmlFor="walkInGuestName" className="mb-2 block">
                Tên khách
              </Label>
              <Input
                id="walkInGuestName"
                name="guestName"
                value={walkInGuestForm.guestName}
                onChange={onWalkInGuestFormChange}
                placeholder="Nhập tên khách hàng"
                disabled={isCheckingIn}
                className="mb-4"
              />

              <Label htmlFor="walkInPhoneNumber" className="mb-2 block">
                Số điện thoại
              </Label>
              <Input
                id="walkInPhoneNumber"
                name="phoneNumber"
                value={walkInGuestForm.phoneNumber}
                onChange={onWalkInGuestFormChange}
                placeholder="Nhập số điện thoại"
                disabled={isCheckingIn}
                className="mb-4"
              />

              <Label htmlFor="walkInCheckInDate" className="mb-2 block">
                Thời gian nhận phòng
              </Label>
              <Input
                id="walkInCheckInDate"
                name="checkInDate"
                type="datetime-local"
                value={walkInGuestForm.checkInDate}
                onChange={onWalkInGuestFormChange}
                disabled={isCheckingIn}
                className="mb-4"
              />

              <Label htmlFor="walkInCheckOutDate" className="mb-2 block">
                Thời gian trả phòng
              </Label>
              <Input
                id="walkInCheckOutDate"
                name="checkOutDate"
                type="datetime-local"
                value={walkInGuestForm.checkOutDate}
                onChange={onWalkInGuestFormChange}
                disabled={isCheckingIn}
                className="mb-4"
              />

              <Label htmlFor="walkInGuestCount" className="mb-2 block">
                Số lượng khách
              </Label>
              <Input
                id="walkInGuestCount"
                name="guestCount"
                type="number"
                min="1"
                value={walkInGuestForm.guestCount}
                onChange={onWalkInGuestFormChange}
                disabled={isCheckingIn}
                className="mb-4"
              />

              <Label htmlFor="walkInNote" className="mb-2 block">
                Ghi chú (không bắt buộc)
              </Label>
              <Textarea
                id="walkInNote"
                name="note"
                value={walkInGuestForm.note}
                onChange={onWalkInGuestFormChange}
                placeholder="Nhập ghi chú (nếu có)"
                rows={3}
                disabled={isCheckingIn}
              />
            </>
          ) : (
            <>
              <Label htmlFor="checkInNote" className="mb-2 block">
                Ghi chú (không bắt buộc)
              </Label>
              <Textarea
                id="checkInNote"
                placeholder="Nhập ghi chú khi nhận phòng"
                value={checkInNote}
                onChange={onCheckInNoteChange}
                className="w-full resize-none"
                rows={3}
                disabled={isCheckingIn}
              />
            </>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel} disabled={isCheckingIn}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isCheckingIn}
            className="bg-primary"
          >
            {isCheckingIn ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Xác nhận
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
