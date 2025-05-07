import { User, Calendar, PenSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookingDetail } from "@/types/room";

interface EditBookingFormProps {
  booking: BookingDetail;
  formData: {
    guestName: string;
    phoneNumber: string;
    guestCount: number;
    checkInDate: string;
    checkOutDate: string;
    note: string;
  };
  isSubmitting: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onNumberInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function EditBookingForm({
  formData,
  isSubmitting,
  onInputChange,
  onNumberInputChange,
}: EditBookingFormProps) {
  return (
    <div className="bg-muted/50 p-3 rounded-md space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Thông tin khách hàng */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <User className="h-4 w-4 mr-1" />
            Thông tin khách hàng
          </h4>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="guestName">Tên khách</Label>
              <Input
                id="guestName"
                name="guestName"
                value={formData.guestName}
                onChange={onInputChange}
                placeholder="Nhập tên khách hàng"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={onInputChange}
                placeholder="Nhập số điện thoại"
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="guestCount">Số lượng khách</Label>
              <Input
                id="guestCount"
                name="guestCount"
                type="number"
                min="1"
                value={formData.guestCount}
                onChange={onNumberInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Thông tin thời gian */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Thời gian lưu trú
          </h4>

          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="checkInDate">Thời gian check-in</Label>
              <Input
                id="checkInDate"
                name="checkInDate"
                type="datetime-local"
                value={formData.checkInDate}
                onChange={onInputChange}
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="checkOutDate">Thời gian check-out</Label>
              <Input
                id="checkOutDate"
                name="checkOutDate"
                type="datetime-local"
                value={formData.checkOutDate}
                onChange={onInputChange}
                disabled={isSubmitting}
              />
            </div>
          </div>
        </div>

        {/* Ghi chú */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <PenSquare className="h-4 w-4 mr-1" />
            Ghi chú
          </h4>

          <div className="grid gap-1.5">
            <Textarea
              id="note"
              name="note"
              value={formData.note}
              onChange={onInputChange}
              placeholder="Nhập ghi chú (nếu có)"
              rows={3}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
