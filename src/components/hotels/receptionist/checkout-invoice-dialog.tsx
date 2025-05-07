import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Save,
  Receipt,
  LogOut,
  Pencil,
  Trash2,
  Plus,
  MinusCircle,
  QrCode,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import axiosInstance from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";

interface InvoiceItem {
  _id?: string;
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

interface PaymentQRResponse {
  qrDataURL: string;
  transactionCode: string;
  amount: number;
  invoiceCode: string;
  invoiceId?: string;
}

interface PaymentCheckResponse {
  success: boolean;
  message: string;
  paid: boolean;
}

interface CheckoutInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: Invoice | null;
  onSuccess?: () => void;
  roomId: string;
}

export function CheckoutInvoiceDialog({
  open,
  onOpenChange,
  invoice,
  onSuccess,
  roomId,
}: CheckoutInvoiceDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "TRANSFER">(
    "CASH"
  );
  const [discount, setDiscount] = useState(invoice?.discount || 0);
  const [note, setNote] = useState("");
  const [editableItems, setEditableItems] = useState<InvoiceItem[]>([]);

  // State cho QR code thanh toán
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<PaymentQRResponse | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] =
    useState<PaymentCheckResponse | null>(null);

  // Ref để lưu trữ interval ID
  const paymentCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tham chiếu đến transaction code đã xác nhận thanh toán
  const confirmedTransactionRef = useRef<string | null>(null);

  // Tính toán tổng tiền từ items
  const totalItemsAmount = editableItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Tính toán lại tổng tiền sau khi áp dụng giảm giá
  const finalAmount = totalItemsAmount - discount;

  // Reset tất cả state khi thay đổi phòng hoặc đóng dialog
  useEffect(() => {
    if (!open) {
      // Khi dialog đóng, reset tất cả state
      setIsEditMode(false);
      setIsSubmitting(false);
      setIsCheckingOut(false);
      setPaymentMethod("CASH");
      confirmedTransactionRef.current = null;
      setDiscount(0);
      setNote("");
      setEditableItems([]);
      setIsGeneratingQR(false);

      // Không reset qrCodeData khi đóng dialog, chỉ reset khi chuyển phòng
      setShowQrDialog(false);
      setIsCheckingPayment(false);
      setPaymentStatus(null);
    } else if (invoice) {
      // Khi dialog mở với invoice mới, khởi tạo lại các giá trị cần thiết
      setDiscount(invoice.discount || 0);
      setEditableItems(invoice.items.map((item) => ({ ...item })));

      // Reset QR data nếu thay đổi invoice
      if (qrCodeData && invoice._id && qrCodeData.invoiceId !== invoice._id) {
        setQrCodeData(null);
      }
    }

    // Cleanup interval khi component unmount hoặc dialog đóng
    return () => {
      if (paymentCheckIntervalRef.current) {
        clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
      }
    };
  }, [open, invoice, roomId]);

  // Thiết lập và xóa interval khi dialog QR mở/đóng
  useEffect(() => {
    // Bắt đầu kiểm tra tự động khi QR dialog mở
    if (showQrDialog && qrCodeData && invoice) {
      // Kiểm tra ngay lập tức một lần khi dialog mở
      checkPaymentStatus();

      // Thiết lập kiểm tra tự động mỗi 10 giây
      paymentCheckIntervalRef.current = setInterval(() => {
        checkPaymentStatus();
      }, 10000);
    } else {
      // Xóa interval khi dialog QR đóng
      if (paymentCheckIntervalRef.current) {
        clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (paymentCheckIntervalRef.current) {
        clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
      }
    };
  }, [showQrDialog, qrCodeData, invoice]);

  // Cập nhật số lượng item
  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setEditableItems((items) =>
      items.map((item, i) => {
        if (i === index) {
          const updatedItem = {
            ...item,
            quantity: newQuantity,
            amount: item.price * newQuantity,
          };
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Xóa item
  const removeItem = (index: number) => {
    setEditableItems((items) => items.filter((_, i) => i !== index));
  };

  // Hàm tạo QR thanh toán
  const generatePaymentQR = async () => {
    if (!invoice) return;

    // Nếu đã có QR code data cho invoice hiện tại, chỉ mở dialog
    if (qrCodeData && qrCodeData.invoiceId === invoice._id) {
      setShowQrDialog(true);
      return;
    }

    try {
      setIsGeneratingQR(true);
      const response = await axiosInstance.post("/payments/generate-qr", {
        invoiceId: invoice._id,
      });

      // Lưu thêm invoiceId để biết QR này thuộc về invoice nào
      const qrData = {
        ...response.data,
        invoiceId: invoice._id,
      };

      setQrCodeData(qrData);
      setShowQrDialog(true);
    } catch (error) {
      console.error("Failed to generate payment QR:", error);
      toast.error("Không thể tạo mã QR thanh toán. Vui lòng thử lại sau.");
    } finally {
      setIsGeneratingQR(false);
    }
  };

  // Hàm sao chép mã giao dịch
  const copyTransactionCode = () => {
    if (qrCodeData?.transactionCode) {
      navigator.clipboard
        .writeText(qrCodeData.transactionCode)
        .then(() => toast.success("Đã sao chép mã giao dịch"))
        .catch(() => toast.error("Không thể sao chép mã giao dịch"));
    }
  };

  // Hàm kiểm tra trạng thái thanh toán
  const checkPaymentStatus = async () => {
    if (!qrCodeData || !invoice) return;

    try {
      setIsCheckingPayment(true);

      const response = await axiosInstance.post("/payments/check-payment", {
        transactionCode: qrCodeData.transactionCode,
        amount: qrCodeData.amount,
        invoiceId: invoice._id,
      });

      setPaymentStatus(response.data);

      // Hiển thị thông báo nếu trạng thái thanh toán thay đổi từ chưa thanh toán sang đã thanh toán
      if (response.data.paid && (!paymentStatus || !paymentStatus.paid)) {
        toast.success("Thanh toán đã được xác nhận!");
        // Lưu mã giao dịch đã xác nhận thanh toán
        confirmedTransactionRef.current = qrCodeData.transactionCode;
      }
    } catch (error) {
      console.error("Failed to check payment status:", error);
      // Chỉ hiển thị thông báo lỗi khi người dùng thực hiện kiểm tra thủ công
      if (!paymentCheckIntervalRef.current) {
        toast.error(
          "Không thể kiểm tra trạng thái thanh toán. Vui lòng thử lại sau."
        );
      }
      setPaymentStatus({
        success: false,
        message: "Có lỗi xảy ra khi kiểm tra thanh toán",
        paid: false,
      });
    } finally {
      setIsCheckingPayment(false);
    }
  };

  // Xử lý cập nhật hóa đơn
  const handleUpdateInvoice = async () => {
    if (!invoice) return;

    try {
      setIsSubmitting(true);

      // Cập nhật hóa đơn với giảm giá và danh sách items mới
      await axiosInstance.patch(`/invoices/${invoice._id}`, {
        discount,
        items: editableItems.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
      });

      toast.success("Cập nhật hóa đơn thành công");
      setIsEditMode(false);

      // Gọi callback để cập nhật dữ liệu
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to update invoice:", error);
      toast.error("Không thể cập nhật hóa đơn. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý trả phòng
  const handleCheckout = async () => {
    if (!roomId) return;

    // Không cho phép trả phòng nếu phương thức là chuyển khoản và chưa xác nhận thanh toán
    if (paymentMethod === "TRANSFER" && !paymentStatus?.paid) {
      toast.error(
        "Vui lòng xác nhận thanh toán chuyển khoản trước khi trả phòng"
      );
      return;
    }

    // Nếu là chuyển khoản, đảm bảo sử dụng mã giao dịch đã được xác nhận
    const finalTransactionReference =
      paymentMethod === "TRANSFER" ? confirmedTransactionRef.current : null;

    try {
      setIsCheckingOut(true);

      // Gọi API trả phòng
      await axiosInstance.post(`/rooms/${roomId}/checkout`, {
        paymentMethod,
        transactionReference: finalTransactionReference || undefined,
        note: note || undefined,
      });

      toast.success("Trả phòng thành công");
      onOpenChange(false);

      // Gọi callback nếu có
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to checkout room:", error);
      toast.error("Không thể trả phòng. Vui lòng thử lại sau.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!invoice) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Hóa đơn thanh toán
            </DialogTitle>
            <DialogDescription>
              Kiểm tra thông tin và xác nhận thanh toán trước khi trả phòng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Thông tin hóa đơn */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã hóa đơn</Label>
                  <div className="text-sm font-medium">
                    {invoice.invoiceCode}
                  </div>
                </div>
                <div>
                  <Label>Khách hàng</Label>
                  <div className="text-sm font-medium">
                    {invoice.customerName}
                  </div>
                </div>
              </div>

              {/* Danh sách hàng hóa */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    Chi tiết hàng hóa ({editableItems.length} mặt hàng)
                  </Label>
                  {!isEditMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditMode(true)}
                      className="h-8"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Sửa
                    </Button>
                  )}
                </div>

                {editableItems.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <div className="grid grid-cols-1 divide-y max-h-[300px] overflow-y-auto">
                      {editableItems.map((item, index) => (
                        <div key={index} className="p-3 flex items-center">
                          <div className="flex-grow">
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatCurrency(item.price)} đ x{" "}
                              {isEditMode ? (
                                <span className="inline-flex items-center ml-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      updateItemQuantity(
                                        index,
                                        item.quantity - 1
                                      )
                                    }
                                  >
                                    <MinusCircle className="h-3.5 w-3.5" />
                                  </Button>
                                  <span className="w-6 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      updateItemQuantity(
                                        index,
                                        item.quantity + 1
                                      )
                                    }
                                  >
                                    <Plus className="h-3.5 w-3.5" />
                                  </Button>
                                </span>
                              ) : (
                                item.quantity
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {formatCurrency(item.price * item.quantity)} đ
                            </div>
                            {isEditMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground border rounded-md">
                    Không có hàng hoá nào trong hóa đơn
                  </div>
                )}
              </div>

              {/* Giảm giá */}
              <div className="space-y-2">
                <Label>Giảm giá</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min={0}
                  max={totalItemsAmount}
                  disabled={!isEditMode}
                />
              </div>

              {/* Tổng tiền */}
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2">
                  <div className="text-sm">Tổng tiền hàng hóa:</div>
                  <div className="font-medium">
                    {formatCurrency(totalItemsAmount)} đ
                  </div>
                </div>
                <div className="flex justify-between items-center p-2">
                  <div className="text-sm">Giảm giá:</div>
                  <div className="font-medium text-destructive">
                    - {formatCurrency(discount)} đ
                  </div>
                </div>
                <div className="flex justify-between items-center bg-muted/50 p-3 rounded-md">
                  <div className="font-medium">Tổng cần thanh toán:</div>
                  <div className="font-bold text-lg">
                    {formatCurrency(finalAmount)} đ
                  </div>
                </div>
              </div>

              <Separator />

              {/* Phương thức thanh toán */}
              <div className="space-y-2">
                <Label>Phương thức thanh toán</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(value) => {
                    setPaymentMethod(value as "CASH" | "TRANSFER");
                    confirmedTransactionRef.current = null;
                    setPaymentStatus(null);
                    if (paymentCheckIntervalRef.current) {
                      clearInterval(paymentCheckIntervalRef.current);
                      paymentCheckIntervalRef.current = null;
                    }
                  }}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CASH" id="cash" />
                    <Label htmlFor="cash">Tiền mặt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="TRANSFER" id="transfer" />
                    <Label htmlFor="transfer">Chuyển khoản</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Phần thanh toán chuyển khoản */}
              {paymentMethod === "TRANSFER" && (
                <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <Label className="text-base">
                        Thanh toán chuyển khoản
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {paymentStatus?.paid
                          ? "Thanh toán đã được xác nhận thành công!"
                          : "Tạo mã QR và xác nhận thanh toán trước khi trả phòng"}
                      </p>
                    </div>
                    <Button
                      variant={paymentStatus?.paid ? "secondary" : "default"}
                      size="sm"
                      onClick={generatePaymentQR}
                      disabled={isGeneratingQR || isEditMode}
                      className="h-9"
                    >
                      {isGeneratingQR ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="mr-2 h-4 w-4" />
                      )}
                      {paymentStatus?.paid
                        ? "Xem lại mã QR"
                        : "Tạo mã QR thanh toán"}
                    </Button>
                  </div>

                  {/* Trạng thái thanh toán */}
                  {paymentStatus && (
                    <div
                      className={`p-3 rounded-md text-sm ${
                        paymentStatus.paid
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {paymentStatus.paid ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <AlertCircle className="h-4 w-4" />
                        )}
                        <span>
                          {paymentStatus.message ||
                            (paymentStatus.paid
                              ? `Thanh toán thành công với mã: ${confirmedTransactionRef.current}`
                              : "Chưa nhận được thanh toán")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ghi chú */}
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm (nếu có)"
                  rows={2}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditMode(false);
                    setEditableItems(
                      invoice.items.map((item) => ({ ...item }))
                    );
                    setDiscount(invoice.discount); // Reset về giá trị ban đầu
                  }}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleUpdateInvoice}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isCheckingOut}
                  className="w-full sm:w-auto"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleCheckout}
                  disabled={
                    isCheckingOut ||
                    (paymentMethod === "TRANSFER" && !paymentStatus?.paid)
                  }
                  className="w-full sm:w-auto"
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <LogOut className="mr-2 h-4 w-4" />
                      Trả phòng
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog hiển thị QR code thanh toán */}
      <Dialog
        open={showQrDialog}
        onOpenChange={(open) => {
          // Nếu đang đóng dialog
          if (!open && paymentCheckIntervalRef.current) {
            clearInterval(paymentCheckIntervalRef.current);
            paymentCheckIntervalRef.current = null;
          }
          setShowQrDialog(open);
        }}
      >
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              QR Code Thanh Toán
            </DialogTitle>
            <DialogDescription className="text-center">
              {paymentStatus?.paid
                ? "Thanh toán đã được xác nhận!"
                : "Quét mã để thanh toán. Hệ thống sẽ tự động kiểm tra mỗi 10 giây."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {qrCodeData?.qrDataURL && (
              <div className="border p-4 rounded-lg shadow-sm bg-white">
                <div className="relative h-[250px] w-[250px]">
                  <Image
                    src={qrCodeData.qrDataURL}
                    alt="QR Code thanh toán"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2 w-full">
              <div className="text-sm font-medium text-center">
                Số tiền: {qrCodeData ? formatCurrency(qrCodeData.amount) : 0} đ
              </div>

              <div className="flex items-center space-x-2 border rounded-md p-2 bg-muted/20">
                <div className="text-sm flex-grow truncate">
                  Nội dung:{" "}
                  <span className="font-medium">
                    {qrCodeData?.transactionCode}
                  </span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={copyTransactionCode}
                  className="h-8 w-8"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              {/* Hiển thị trạng thái thanh toán */}
              {paymentStatus && (
                <div
                  className={`p-2 rounded-md text-sm ${
                    paymentStatus.paid
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {paymentStatus.paid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>
                      {paymentStatus.message ||
                        (paymentStatus.paid
                          ? "Thanh toán thành công"
                          : "Chưa nhận được thanh toán")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3 flex flex-col">
            {!paymentStatus?.paid && (
              <Button
                onClick={checkPaymentStatus}
                disabled={isCheckingPayment}
                variant="outline"
                className="w-full"
              >
                {isCheckingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang kiểm tra...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Kiểm tra thanh toán ngay
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={() => setShowQrDialog(false)}
              variant={paymentStatus?.paid ? "default" : "secondary"}
              className="w-full"
            >
              {paymentStatus?.paid ? "Xác nhận và đóng" : "Đóng"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
