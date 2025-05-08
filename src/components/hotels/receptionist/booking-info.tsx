import { User, Phone, Users2, PenSquare, Calendar } from "lucide-react";
import { BookingDetail } from "@/types/room";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// Helper function to format date/time
function formatDateTime(dateString: string) {
  try {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", {
      locale: vi,
    });
  } catch (error) {
    console.error("Error formatting date/time:", error);
    return "N/A";
  }
}

// Helper function to calculate duration between check-in and check-out
function calculateDuration(checkInDate: string, checkOutDate: string) {
  try {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    if (diffDays > 0) {
      return `${diffDays} ngày ${diffHours} giờ`;
    } else {
      return `${diffHours} giờ`;
    }
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "N/A";
  }
}

interface BookingInfoProps {
  booking: BookingDetail;
}

export function BookingInfo({ booking }: BookingInfoProps) {
  return (
    <div className="bg-muted/50 p-3 rounded-md space-y-4">
      {/* Thông tin khách hàng */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center">
          <User className="h-4 w-4 mr-1" />
          Thông tin khách hàng
        </h4>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <div className="font-medium">Tên khách:</div>
          <div>{booking.guestName}</div>

          <div className="font-medium flex items-center">
            <Phone className="h-3 w-3 mr-1" />
            Số điện thoại:
          </div>
          <div>{booking.phoneNumber}</div>

          <div className="font-medium flex items-center">
            <Users2 className="h-3 w-3 mr-1" />
            Số khách:
          </div>
          <div>{booking.guestCount} người</div>
        </div>
      </div>

      {/* Thông tin thời gian */}
      <div>
        <h4 className="text-sm font-medium mb-2 flex items-center">
          <Calendar className="h-4 w-4 mr-1" />
          Thời gian lưu trú
        </h4>
        <div className="grid grid-cols-1 gap-y-2 text-sm">
          <div className="flex justify-between items-center">
            <div className="font-medium">Check-in:</div>
            <div>{formatDateTime(booking.checkInDate)}</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="font-medium">Check-out:</div>
            <div>{formatDateTime(booking.checkOutDate)}</div>
          </div>

          <div className="flex justify-between items-center">
            <div className="font-medium">Thời gian lưu trú:</div>
            <div>
              {calculateDuration(booking.checkInDate, booking.checkOutDate)}
            </div>
          </div>
        </div>
      </div>

      {/* Ghi chú và người tạo */}
      <div>
        <div className="grid gap-y-2 text-sm">
          {booking.note && (
            <>
              <div className="font-medium flex items-center">
                <PenSquare className="h-3 w-3 mr-1" />
                Ghi chú:
              </div>
              <div className="bg-background/80 p-2 rounded text-xs">
                {booking.note || "Không có ghi chú"}
              </div>
            </>
          )}

          <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
            <div>Người tạo: {booking.createdBy?.name}</div>
            <div>{format(new Date(booking.createdAt), "dd/MM/yyyy")}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
