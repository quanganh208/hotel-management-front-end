import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RoomWithType, RoomStatus, BookingDetail } from "@/types/room";
import {
  Calendar,
  Clock,
  Info,
  Users,
  Loader2,
  Save,
  X,
  LogIn,
  ShoppingBag,
  LogOut,
  Search,
  CheckCircle,
  Plus,
  Package,
  Receipt,
} from "lucide-react";
import { BookingDialog } from "./booking-dialog";
import { getStatusText } from "../rooms/utils/room-status-helpers";
import {
  getLatestBookingByRoomId,
  updateBooking,
  checkInRoom,
  directCheckInRoom,
} from "@/lib/booking-service";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axios";
import { InventoryItem } from "@/types/inventory";
import { useDebounce } from "@/hooks/use-debounce";
import { RoomInfo } from "./room-info";
import { BookingInfo } from "./booking-info";
import { EditBookingForm } from "./edit-booking-form";
import { CheckInDialog } from "./check-in-dialog";
import { CheckoutInvoiceDialog } from "./checkout-invoice-dialog";

interface AddItemsDialogProps {
  roomId: string;
  hotelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  currentInvoice: Invoice | null;
}

interface CartItem {
  itemId: string;
  quantity: number;
  name: string;
  price: number;
  image?: string;
}

interface InvoiceItem {
  itemId: string;
  name: string;
  type: string;
  quantity: number;
  price: number;
  amount: number;
  note?: string;
}

interface Invoice {
  _id: string;
  hotelId: string;
  invoiceCode: string;
  invoiceType: string;
  roomId: string;
  bookingId: string;
  customerName: string;
  customerPhone: string;
  note?: string;
  checkInDate: string;
  checkOutDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: string;
}

function AddItemsDialog({
  hotelId,
  open,
  onOpenChange,
  onSuccess,
  currentInvoice,
}: AddItemsDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<InventoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Sử dụng debounce để tránh gọi API quá nhiều lần
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset trạng thái khi dialog đóng
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSearchResults([]);
      setCartItems([]);
    }
  }, [open]);

  // Khi search term thay đổi, gọi API tìm kiếm
  useEffect(() => {
    const searchInventory = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await axiosInstance.get(`/inventory/search`, {
          params: {
            hotelId,
            query: debouncedSearchTerm,
          },
        });
        setSearchResults(response.data);
      } catch (error) {
        console.error("Error searching inventory:", error);
        toast.error("Không thể tìm kiếm hàng hoá");
      } finally {
        setIsSearching(false);
      }
    };

    searchInventory();
  }, [debouncedSearchTerm, hotelId]);

  // Thêm item vào giỏ hàng
  const addToCart = (item: InventoryItem) => {
    setCartItems((prev) => {
      // Kiểm tra xem item đã có trong giỏ hàng chưa
      const existingItem = prev.find(
        (cartItem) => cartItem.itemId === item._id
      );

      if (existingItem) {
        // Nếu đã có, tăng số lượng
        return prev.map((cartItem) =>
          cartItem.itemId === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Nếu chưa có, thêm vào giỏ hàng
        return [
          ...prev,
          {
            itemId: item._id,
            quantity: 1,
            name: item.name,
            price: item.sellingPrice,
            image: item.image,
          },
        ];
      }
    });
  };

  // Thay đổi số lượng item trong giỏ hàng
  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Xoá item khỏi giỏ hàng
  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  // Tính tổng tiền giỏ hàng
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Lưu danh sách hàng hoá
  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất một hàng hoá");
      return;
    }

    if (!currentInvoice) {
      toast.error("Không tìm thấy hóa đơn hiện tại của phòng");
      return;
    }

    setIsSubmitting(true);
    try {
      // Chuẩn bị dữ liệu để gửi lên API
      const items = cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      // Gọi API để thêm hàng hoá vào hóa đơn
      await axiosInstance.post(`/invoices/${currentInvoice._id}/items`, {
        hotelId: hotelId,
        items: items,
      });

      toast.success("Thêm hàng hoá thành công");

      // Đóng dialog và reset trạng thái
      onOpenChange(false);
      setCartItems([]);

      // Gọi callback nếu có
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to add items to invoice:", error);
      toast.error("Không thể thêm hàng hoá. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Thêm hàng hoá cho phòng
          </DialogTitle>
          <DialogDescription>
            Tìm kiếm và thêm hàng hoá vào phòng
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Hiển thị hóa đơn hiện tại */}
          {currentInvoice ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center">
                  <Receipt className="h-4 w-4 mr-1" />
                  Hóa đơn hiện tại: {currentInvoice.invoiceCode}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {currentInvoice.status === "open" ? "Đang mở" : "Đã đóng"}
                </Badge>
              </div>

              {currentInvoice.items.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 divide-y max-h-[200px] overflow-y-auto">
                    {currentInvoice.items.map((item, index) => (
                      <div key={index} className="p-3 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md overflow-hidden relative bg-muted flex-shrink-0 flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(item.price)} đ x {item.quantity}
                          </div>
                          {item.note && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.note}
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(item.amount)} đ
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground border rounded-md">
                  Chưa có hàng hoá nào trong hóa đơn
                </div>
              )}

              {/* Tổng tiền hóa đơn */}
              <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                <div className="font-medium">Tổng tiền hóa đơn:</div>
                <div className="font-bold">
                  {formatCurrency(currentInvoice.finalAmount)} đ
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground border rounded-md">
              Không tìm thấy hóa đơn hiện tại
            </div>
          )}

          <Separator />

          {/* Tìm kiếm hàng hoá */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Thêm hàng hoá mới</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm hàng hoá..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Danh sách kết quả tìm kiếm */}
            {isSearching ? (
              <div className="flex justify-center items-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                <span className="text-sm text-muted-foreground">
                  Đang tìm kiếm...
                </span>
              </div>
            ) : searchTerm && searchResults.length > 0 ? (
              <div className="border rounded-md overflow-hidden">
                <div className="grid grid-cols-1 divide-y max-h-[200px] overflow-y-auto">
                  {searchResults.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 flex items-center gap-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => addToCart(item)}
                    >
                      <div className="h-12 w-12 rounded-md overflow-hidden relative bg-muted flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <Package className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.unit} • {formatCurrency(item.sellingPrice)} đ •
                          Còn lại: {item.stock} {item.unit}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : searchTerm && searchResults.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                Không tìm thấy hàng hoá phù hợp
              </div>
            ) : null}
          </div>

          {/* Giỏ hàng */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Giỏ hàng</h3>

            {cartItems.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border rounded-md">
                Chưa có hàng hoá nào được thêm
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border rounded-md overflow-hidden">
                  <div className="grid grid-cols-1 divide-y max-h-[200px] overflow-y-auto">
                    {cartItems.map((item) => (
                      <div
                        key={item.itemId}
                        className="p-3 flex items-center gap-3"
                      >
                        <div className="h-12 w-12 rounded-md overflow-hidden relative bg-muted flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-grow">
                          <div className="font-medium text-sm">{item.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} đ
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.itemId, item.quantity - 1)
                            }
                          >
                            <span>-</span>
                          </Button>
                          <span className="w-6 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.itemId, item.quantity + 1)
                            }
                          >
                            <span>+</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeFromCart(item.itemId)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tổng tiền */}
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                  <div className="font-medium">Tổng tiền giỏ hàng:</div>
                  <div className="font-bold">
                    {formatCurrency(totalAmount)} đ
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || cartItems.length === 0 || !currentInvoice}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Lưu hàng hoá
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RoomDetailDialogProps {
  room: RoomWithType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookingSuccess?: () => void;
}

// Form để chỉnh sửa thông tin đặt phòng
interface EditBookingFormData {
  guestName: string;
  phoneNumber: string;
  guestCount: number;
  checkInDate: string;
  checkOutDate: string;
  note: string;
}

// Form để nhận phòng trực tiếp cho khách vãng lai
interface DirectCheckInFormData {
  guestName: string;
  phoneNumber: string;
  guestCount: number;
  checkInDate: string;
  checkOutDate: string;
  note: string;
}

// Hàm trợ giúp cho màu sắc
function getStatusColorClass(status: RoomStatus): string {
  switch (status) {
    case RoomStatus.AVAILABLE:
      return "text-green-600 bg-green-100";
    case RoomStatus.OCCUPIED:
      return "text-purple-600 bg-purple-100";
    case RoomStatus.BOOKED:
      return "text-blue-600 bg-blue-100";
    case RoomStatus.CHECKED_IN:
      return "text-indigo-600 bg-indigo-100";
    case RoomStatus.CHECKED_OUT:
      return "text-amber-600 bg-amber-100";
    case RoomStatus.CLEANING:
      return "text-cyan-600 bg-cyan-100";
    case RoomStatus.MAINTENANCE:
      return "text-red-600 bg-red-100";
    case RoomStatus.OUT_OF_SERVICE:
      return "text-gray-600 bg-gray-100";
    case RoomStatus.RESERVED:
      return "text-teal-600 bg-teal-100";
    default:
      return "text-slate-600 bg-slate-100";
  }
}

export function RoomDetailDialog({
  room,
  open,
  onOpenChange,
  onBookingSuccess,
}: RoomDetailDialogProps) {
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomWithType | null>(null);
  const [latestBooking, setLatestBooking] = useState<BookingDetail | null>(
    null
  );
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Trạng thái cho AlertDialog nhận phòng
  const [checkInDialogOpen, setCheckInDialogOpen] = useState(false);
  const [checkInNote, setCheckInNote] = useState("");
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Trạng thái cho khách vãng lai
  const [isWalkInGuest, setIsWalkInGuest] = useState(false);
  const [walkInGuestForm, setWalkInGuestForm] = useState<DirectCheckInFormData>(
    {
      guestName: "",
      phoneNumber: "",
      guestCount: 1,
      checkInDate: "",
      checkOutDate: "",
      note: "",
    }
  );

  const [formData, setFormData] = useState<EditBookingFormData>({
    guestName: "",
    phoneNumber: "",
    guestCount: 1,
    checkInDate: "",
    checkOutDate: "",
    note: "",
  });

  const [addItemsDialogOpen, setAddItemsDialogOpen] = useState(false);
  const [checkoutInvoiceDialogOpen, setCheckoutInvoiceDialogOpen] =
    useState(false);

  // Thiết lập phòng được chọn cho dialog đặt phòng khi component được khởi tạo
  useEffect(() => {
    if (open && room) {
      setSelectedRoom(room);

      // Fetch booking mới nhất khi dialog mở
      if (
        [
          RoomStatus.BOOKED,
          RoomStatus.RESERVED,
          RoomStatus.CHECKED_IN,
        ].includes(room.status)
      ) {
        fetchLatestBooking(room._id);
      }

      // Reset edit mode khi mở dialog
      setIsEditMode(false);
    }
  }, [open, room]);

  // Cập nhật form data khi có booking mới
  useEffect(() => {
    if (latestBooking) {
      const checkInDateTime = parseISO(latestBooking.checkInDate);
      const checkOutDateTime = parseISO(latestBooking.checkOutDate);

      setFormData({
        guestName: latestBooking.guestName || "",
        phoneNumber: latestBooking.phoneNumber || "",
        guestCount: latestBooking.guestCount || 1,
        checkInDate: format(checkInDateTime, "yyyy-MM-dd'T'HH:mm"),
        checkOutDate: format(checkOutDateTime, "yyyy-MM-dd'T'HH:mm"),
        note: latestBooking.note || "",
      });
    }
  }, [latestBooking]);

  // Hàm fetch booking mới nhất của phòng
  const fetchLatestBooking = async (roomId: string) => {
    setIsLoadingBooking(true);
    try {
      const booking = await getLatestBookingByRoomId(roomId);
      setLatestBooking(booking);
    } catch (error) {
      console.error("Failed to fetch latest booking:", error);
      toast.error("Không thể tải thông tin đặt phòng");
    } finally {
      setIsLoadingBooking(false);
    }
  };

  // Hàm fetch hóa đơn hiện tại của phòng
  const fetchCurrentInvoice = async (roomId: string) => {
    try {
      const response = await axiosInstance.get(
        `/invoices/room/${roomId}/active`
      );
      setCurrentInvoice(response.data);
    } catch (error) {
      console.error("Failed to fetch current invoice:", error);
      toast.error("Không thể tải thông tin hóa đơn");
    }
  };

  // Xử lý hành động dựa trên trạng thái phòng
  function handleBookRoom() {
    setBookingDialogOpen(true);
  }

  function handleEditBooking() {
    if (latestBooking) {
      setIsEditMode(true);
    } else {
      toast.error("Không tìm thấy thông tin đặt phòng");
    }
  }

  function handleCancelEdit() {
    if (latestBooking) {
      // Reset form data về giá trị ban đầu từ latestBooking
      const checkInDateTime = parseISO(latestBooking.checkInDate);
      const checkOutDateTime = parseISO(latestBooking.checkOutDate);

      setFormData({
        guestName: latestBooking.guestName || "",
        phoneNumber: latestBooking.phoneNumber || "",
        guestCount: latestBooking.guestCount || 1,
        checkInDate: format(checkInDateTime, "yyyy-MM-dd'T'HH:mm"),
        checkOutDate: format(checkOutDateTime, "yyyy-MM-dd'T'HH:mm"),
        note: latestBooking.note || "",
      });
    }

    // Tắt chế độ chỉnh sửa
    setIsEditMode(false);
  }

  async function handleSubmitEdit() {
    if (!latestBooking?._id) return;

    try {
      setIsSubmitting(true);

      const bookingData = {
        guestName: formData.guestName,
        phoneNumber: formData.phoneNumber,
        guestCount: formData.guestCount,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        note: formData.note,
      };

      await updateBooking(latestBooking._id, bookingData);

      // Reload booking data
      if (room._id) {
        await fetchLatestBooking(room._id);
      }

      // Close edit mode
      setIsEditMode(false);

      toast.success("Cập nhật đặt phòng thành công");

      // Call onBookingSuccess if provided
      if (onBookingSuccess) {
        onBookingSuccess();
      }
    } catch (error) {
      console.error("Failed to update booking:", error);
      toast.error("Không thể cập nhật thông tin đặt phòng");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCheckIn() {
    if (latestBooking) {
      // Mở AlertDialog nhận phòng
      setCheckInDialogOpen(true);
    } else {
      toast.error("Không tìm thấy thông tin đặt phòng");
    }
  }

  // Xử lý nhận phòng
  async function handleConfirmCheckIn() {
    if (!room._id) return;

    try {
      setIsCheckingIn(true);

      if (isWalkInGuest) {
        // Kiểm tra dữ liệu nhập vào cho khách vãng lai
        if (!walkInGuestForm.guestName) {
          toast.error("Vui lòng nhập tên khách hàng");
          setIsCheckingIn(false);
          return;
        }

        if (!walkInGuestForm.phoneNumber) {
          toast.error("Vui lòng nhập số điện thoại khách hàng");
          setIsCheckingIn(false);
          return;
        }

        if (!walkInGuestForm.checkInDate) {
          toast.error("Vui lòng nhập thời gian nhận phòng");
          setIsCheckingIn(false);
          return;
        }

        if (!walkInGuestForm.checkOutDate) {
          toast.error("Vui lòng nhập thời gian trả phòng");
          setIsCheckingIn(false);
          return;
        }

        // Gọi API nhận phòng trực tiếp cho khách vãng lai
        await directCheckInRoom(room._id, {
          guestName: walkInGuestForm.guestName,
          phoneNumber: walkInGuestForm.phoneNumber,
          guestCount: walkInGuestForm.guestCount,
          checkInDate: walkInGuestForm.checkInDate,
          checkOutDate: walkInGuestForm.checkOutDate,
          note: walkInGuestForm.note,
        });

        toast.success("Nhận phòng trực tiếp thành công");
      } else {
        // Trường hợp nhận phòng cho đặt phòng đã có
        if (!latestBooking?._id) {
          toast.error("Không tìm thấy thông tin đặt phòng");
          setIsCheckingIn(false);
          return;
        }

        // Gọi API nhận phòng
        await checkInRoom(room._id, latestBooking._id, checkInNote);

        toast.success("Nhận phòng thành công");
      }

      // Cập nhật lại danh sách phòng nếu cần
      if (onBookingSuccess) {
        onBookingSuccess();
      }

      // Đóng dialog nhận phòng
      setCheckInDialogOpen(false);

      // Reset thông tin khách vãng lai và note
      setWalkInGuestForm({
        guestName: "",
        phoneNumber: "",
        guestCount: 1,
        checkInDate: "",
        checkOutDate: "",
        note: "",
      });
      setCheckInNote("");
      setIsWalkInGuest(false);

      // Đóng dialog chi tiết phòng
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to check in room:", error);
      toast.error("Không thể nhận phòng. Vui lòng thử lại sau.");
    } finally {
      setIsCheckingIn(false);
    }
  }

  // Xử lý trả phòng
  function handleCheckOut() {
    // Kiểm tra xem có hóa đơn không
    if (!room._id) {
      toast.error("Không tìm thấy thông tin phòng");
      return;
    }

    // Cập nhật hóa đơn mới nhất trước khi hiển thị dialog
    fetchCurrentInvoice(room._id);

    // Mở dialog hóa đơn thanh toán
    setCheckoutInvoiceDialogOpen(true);
  }

  // Xử lý xác nhận trả phòng sau khi thanh toán
  async function handleConfirmCheckOut() {
    // Đóng dialog chi tiết phòng
    onOpenChange(false);

    // Cập nhật lại danh sách phòng nếu cần
    if (onBookingSuccess) {
      onBookingSuccess();
    }
  }

  // Handle form input change
  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNumberInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const numValue = parseInt(value);

    if (!isNaN(numValue) && numValue > 0) {
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    }
  }

  // Render các nút hành động dựa trên trạng thái phòng
  function renderActionButtons() {
    if (isEditMode) {
      return (
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isSubmitting}
          >
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={handleSubmitEdit} disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      );
    }

    switch (room.status) {
      case RoomStatus.AVAILABLE:
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button onClick={handleBookRoom} className="w-full">
              <Calendar className="mr-2 h-4 w-4" />
              Đặt phòng
            </Button>
            <Button
              onClick={() => {
                setIsWalkInGuest(true);
                setCheckInDialogOpen(true);
              }}
              className="w-full"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Nhận phòng trực tiếp
            </Button>
          </div>
        );
      case RoomStatus.BOOKED:
      case RoomStatus.RESERVED:
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" onClick={handleEditBooking}>
              <Info className="mr-2 h-4 w-4" />
              Sửa đặt phòng
            </Button>
            <Button onClick={handleCheckIn}>
              <Users className="mr-2 h-4 w-4" />
              Nhận phòng
            </Button>
          </div>
        );
      case RoomStatus.CHECKED_IN:
        return (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              onClick={() => {
                if (room._id) {
                  // Lấy hóa đơn mới nhất trước khi mở dialog
                  fetchCurrentInvoice(room._id);
                  setAddItemsDialogOpen(true);
                }
              }}
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              Thêm hàng hoá
            </Button>
            <Button onClick={handleCheckOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Trả phòng
            </Button>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Phòng {room.roomNumber} - Tầng {room.floor}
            </DialogTitle>
            <div className="mt-1">
              <Badge
                variant="outline"
                className={getStatusColorClass(room.status)}
              >
                {getStatusText(room.status)}
              </Badge>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Thông tin phòng */}
            <RoomInfo room={room} />

            <Separator />

            {/* Thông tin đặt phòng hiện tại (nếu có) */}
            {(room.status === RoomStatus.BOOKED ||
              room.status === RoomStatus.RESERVED ||
              room.status === RoomStatus.CHECKED_IN) && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Thông tin đặt phòng
                </h3>

                {isLoadingBooking ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                    <span className="text-sm text-muted-foreground">
                      Đang tải...
                    </span>
                  </div>
                ) : latestBooking ? (
                  isEditMode ? (
                    <EditBookingForm
                      booking={latestBooking}
                      formData={formData}
                      isSubmitting={isSubmitting}
                      onInputChange={handleInputChange}
                      onNumberInputChange={handleNumberInputChange}
                    />
                  ) : (
                    <BookingInfo booking={latestBooking} />
                  )
                ) : (
                  <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground text-center">
                    Không tìm thấy thông tin đặt phòng
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">{renderActionButtons()}</DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog đặt phòng */}
      {selectedRoom && (
        <BookingDialog
          open={bookingDialogOpen}
          onOpenChange={(open) => {
            setBookingDialogOpen(open);
            // Reload booking data when closing booking dialog
            if (
              !open &&
              room._id &&
              [
                RoomStatus.BOOKED,
                RoomStatus.RESERVED,
                RoomStatus.CHECKED_IN,
              ].includes(room.status)
            ) {
              fetchLatestBooking(room._id);
            }
          }}
          rooms={[selectedRoom]}
          onBookingSuccess={() => {
            if (onBookingSuccess) onBookingSuccess();
            // Reload booking data after successful booking
            if (room._id) {
              fetchLatestBooking(room._id);
            }
          }}
        />
      )}

      {/* Dialog nhận phòng */}
      <CheckInDialog
        open={checkInDialogOpen}
        onOpenChange={setCheckInDialogOpen}
        roomNumber={room.roomNumber}
        booking={latestBooking}
        isWalkInGuest={isWalkInGuest}
        walkInGuestForm={walkInGuestForm}
        checkInNote={checkInNote}
        isCheckingIn={isCheckingIn}
        onWalkInGuestFormChange={(e) => {
          const { name, value } = e.target;
          setWalkInGuestForm((prev) => ({
            ...prev,
            [name]: value,
          }));
        }}
        onCheckInNoteChange={(e) => setCheckInNote(e.target.value)}
        onConfirm={handleConfirmCheckIn}
        onCancel={() => {
          setIsWalkInGuest(false);
          setCheckInDialogOpen(false);
        }}
      />

      {/* Dialog hóa đơn thanh toán */}
      <CheckoutInvoiceDialog
        open={checkoutInvoiceDialogOpen}
        onOpenChange={(open) => {
          // Cập nhật hóa đơn mới nhất khi mở dialog
          if (open && room._id) {
            fetchCurrentInvoice(room._id);
          }
          setCheckoutInvoiceDialogOpen(open);
        }}
        invoice={currentInvoice}
        onSuccess={handleConfirmCheckOut}
        roomId={room._id}
      />

      {/* Dialog thêm hàng hoá */}
      <AddItemsDialog
        roomId={room._id}
        hotelId={room.hotelId}
        open={addItemsDialogOpen}
        onOpenChange={(open) => {
          // Cập nhật hóa đơn mới nhất khi mở dialog
          if (open && room._id) {
            fetchCurrentInvoice(room._id);
          }
          setAddItemsDialogOpen(open);
        }}
        onSuccess={() => {
          if (onBookingSuccess) onBookingSuccess();
          // Cập nhật hóa đơn sau khi thêm hàng hóa thành công
          if (room._id) {
            fetchCurrentInvoice(room._id);
          }
        }}
        currentInvoice={currentInvoice}
      />
    </>
  );
}
