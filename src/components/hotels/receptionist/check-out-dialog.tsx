import { Loader2, CheckSquare, LogOut } from "lucide-react";
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

interface CheckOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomNumber: string;
  isCheckingOut: boolean;
  onConfirm: () => void;
}

export function CheckOutDialog({
  open,
  onOpenChange,
  roomNumber,
  isCheckingOut,
  onConfirm,
}: CheckOutDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-primary" />
            Xác nhận trả phòng
          </AlertDialogTitle>
          <AlertDialogDescription>
            Xác nhận trả phòng {roomNumber}? Hệ thống sẽ tạo hoá đơn tự động sau
            khi trả phòng.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isCheckingOut}>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isCheckingOut}
            className="bg-primary"
          >
            {isCheckingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckSquare className="mr-2 h-4 w-4" />
                Xác nhận trả phòng
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
