import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  CalendarClock,
  Phone,
  UserRound,
  ClipboardList,
  BedDouble,
} from "lucide-react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import axios from "@/lib/axios";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { checkInRoom } from "@/lib/booking-service";

interface SearchBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotelId: string;
  onCheckInSuccess?: () => void;
}

interface Room {
  _id: string;
  roomNumber: string;
  floor: string;
}

interface User {
  _id: string;
  email: string;
  name: string;
}

interface Booking {
  _id: string;
  roomId: Room;
  guestName: string;
  phoneNumber: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
  guestCount: number;
  note: string;
  createdBy: User;
  createdAt: string;
}

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Chờ xác nhận
        </Badge>
      );
    case "confirmed":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Đã xác nhận
        </Badge>
      );
    case "checked_in":
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Đã nhận phòng
        </Badge>
      );
    case "checked_out":
      return (
        <Badge variant="outline" className="border-gray-500 text-gray-500">
          Đã trả phòng
        </Badge>
      );
    case "cancelled":
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Đã hủy
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function SearchBookingDialog({
  open,
  onOpenChange,
  hotelId,
  onCheckInSuccess,
}: SearchBookingDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch();
    } else {
      setBookings([]);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = async () => {
    if (!debouncedSearchTerm.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.get(`/bookings/search`, {
        params: {
          hotelId,
          search: debouncedSearchTerm,
        },
      });
      setBookings(data);
    } catch (error) {
      console.error("Lỗi khi tìm kiếm đặt phòng:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (booking: Booking) => {
    setCheckingIn(booking._id);
    try {
      await checkInRoom(booking.roomId._id, booking._id);

      toast.success("Nhận phòng thành công");

      // Cập nhật trạng thái booking trong danh sách
      setBookings(
        bookings.map((item) =>
          item._id === booking._id ? { ...item, status: "checked_in" } : item,
        ),
      );

      // Gọi callback để refresh danh sách phòng
      if (onCheckInSuccess) {
        onCheckInSuccess();
      }
    } catch (error) {
      console.error("Lỗi khi nhận phòng:", error);
      toast.error("Có lỗi xảy ra khi nhận phòng");
    } finally {
      setCheckingIn(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm đặt phòng
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Nhập số điện thoại hoặc tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Tìm kiếm
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : bookings.length > 0 ? (
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {bookings.map((booking) => (
              <Card key={booking._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border">
                        <AvatarFallback>
                          {getInitials(booking.guestName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {booking.guestName}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {booking.phoneNumber}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="pb-3 grid grid-cols-2 gap-y-2">
                  <div className="flex items-center gap-2">
                    <BedDouble className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Phòng{" "}
                      <span className="font-medium">
                        {booking.roomId.roomNumber}
                      </span>{" "}
                      (Tầng {booking.roomId.floor})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.guestCount} khách</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Nhận: {formatDate(booking.checkInDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Trả: {formatDate(booking.checkOutDate)}
                    </span>
                  </div>
                  {booking.note && (
                    <div className="col-span-2 flex items-start gap-2 mt-1">
                      <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">
                        {booking.note}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-0 pb-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <span>Đặt bởi: {booking.createdBy.name}</span>
                  </div>
                  <Button
                    onClick={() => handleCheckIn(booking)}
                    disabled={
                      booking.status === "checked_in" ||
                      booking.status === "checked_out" ||
                      booking.status === "cancelled" ||
                      checkingIn === booking._id
                    }
                    className={
                      booking.status.toLowerCase() !== "checked_in"
                        ? "gap-2"
                        : ""
                    }
                    variant={
                      booking.status.toLowerCase() === "checked_in"
                        ? "outline"
                        : "default"
                    }
                  >
                    {checkingIn === booking._id ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    ) : booking.status === "checked_in" ? (
                      "Đã nhận phòng"
                    ) : (
                      <>Nhận phòng</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : searchTerm ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">
              Không tìm thấy đặt phòng
            </h3>
            <p className="text-muted-foreground">
              Vui lòng thử tìm kiếm với từ khóa khác
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-full mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">Tìm kiếm đặt phòng</h3>
            <p className="text-muted-foreground">
              Nhập số điện thoại hoặc tên khách hàng để tìm kiếm
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
