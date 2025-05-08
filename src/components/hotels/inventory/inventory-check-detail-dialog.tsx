"use client";
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Loader2,
  ClipboardEdit,
  FileCheck2,
  AlertCircle,
  X,
  Save,
  Pencil,
  Trash2,
} from "lucide-react";
import { InventoryCheckStatus, InventoryCheck } from "@/types/inventory";
import { useInventoryCheckStore } from "@/store/inventory-check";
import { toast } from "sonner";

interface InventoryCheckDetailDialogProps {
  inventoryCheckId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface EditableInventoryCheckItem {
  inventoryItemId: string;
  inventoryCode: string;
  name: string;
  unit: string;
  systemStock: number;
  actualStock: number;
  difference: number;
}

export function InventoryCheckDetailDialog({
  inventoryCheckId,
  open,
  onOpenChange,
}: InventoryCheckDetailDialogProps) {
  const {
    selectedCheck,
    isLoading,
    fetchInventoryCheckById,
    balanceInventoryCheck,
    updateInventoryCheck,
    deleteInventoryCheck,
  } = useInventoryCheckStore();
  const [isBalancing, setIsBalancing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBalanceDialog, setShowBalanceDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editedNote, setEditedNote] = useState("");
  const [editedItems, setEditedItems] = useState<EditableInventoryCheckItem[]>(
    [],
  );
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch details when dialog opens
  useEffect(() => {
    if (open && inventoryCheckId) {
      fetchInventoryCheckById(inventoryCheckId);
      setIsEditing(false);
      setEditingItemId(null);
    }
  }, [open, inventoryCheckId, fetchInventoryCheckById]);

  // Initialize edited items when selected check changes
  useEffect(() => {
    if (selectedCheck) {
      const items = selectedCheck.items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        inventoryCode: item.inventoryCode,
        name: item.name,
        unit: item.unit,
        systemStock: item.systemStock,
        actualStock: item.actualStock,
        difference: item.difference,
      }));
      setEditedItems(items);
      setEditedNote(selectedCheck.note || "");
    }
  }, [selectedCheck]);

  const handleCloseDialog = () => {
    setIsEditing(false);
    onOpenChange(false);
  };

  const handleOpenBalanceDialog = () => {
    setShowBalanceDialog(true);
  };

  const handleBalance = async () => {
    setIsBalancing(true);
    try {
      const success = await balanceInventoryCheck(inventoryCheckId);
      if (success) {
        setShowBalanceDialog(false);
        toast.success("Cân bằng kho thành công");
      }
    } finally {
      setIsBalancing(false);
    }
  };

  const handleEditStart = () => {
    setIsEditing(true);
    setActiveTab("items");
  };

  const handleEditCancel = () => {
    // Reset to original values
    if (selectedCheck) {
      const items = selectedCheck.items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        inventoryCode: item.inventoryCode,
        name: item.name,
        unit: item.unit,
        systemStock: item.systemStock,
        actualStock: item.actualStock,
        difference: item.difference,
      }));
      setEditedItems(items);
      setEditedNote(selectedCheck.note || "");
    }
    setIsEditing(false);
    setEditingItemId(null);
  };

  const handleEditSave = async () => {
    if (!selectedCheck) return;

    setIsSaving(true);
    try {
      // Prepare update data according to Partial<InventoryCheck> type
      const updateData: Partial<InventoryCheck> = {
        hotelId: selectedCheck.hotelId,
        note: editedNote,
        items: editedItems,
      };

      // Call API to update the inventory check
      const success = await updateInventoryCheck(inventoryCheckId, updateData);

      if (success) {
        setIsEditing(false);
        setEditingItemId(null);
      }
    } catch (error) {
      console.error("Error updating inventory check:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartEditingItem = (inventoryItemId: string) => {
    setEditingItemId(inventoryItemId);
  };

  const handleCancelEditingItem = () => {
    setEditingItemId(null);
  };

  const handleUpdateActualStock = (inventoryItemId: string, value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 0) return;

    setEditedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.inventoryItemId === inventoryItemId) {
          const difference = numValue - item.systemStock;
          return {
            ...item,
            actualStock: numValue,
            difference,
          };
        }
        return item;
      }),
    );
  };

  const handleOpenDeleteDialog = () => {
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteInventoryCheck(inventoryCheckId);
      if (success) {
        setShowDeleteDialog(false);
        onOpenChange(false);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Calculate totals based on edited values when in edit mode
  const calculateTotals = () => {
    if (!editedItems.length)
      return { totalDifference: 0, totalIncrease: 0, totalDecrease: 0 };

    const totalDifference = editedItems.reduce(
      (sum, item) => sum + item.difference,
      0,
    );

    const totalIncrease = editedItems
      .filter((item) => item.difference > 0)
      .reduce((sum, item) => sum + item.difference, 0);

    const totalDecrease = editedItems
      .filter((item) => item.difference < 0)
      .reduce((sum, item) => sum + item.difference, 0);

    return { totalDifference, totalIncrease, totalDecrease };
  };

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  // Helper to get status badge
  const getStatusBadge = (status: InventoryCheckStatus) => {
    switch (status) {
      case InventoryCheckStatus.DRAFT:
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900"
          >
            Phiếu tạm
          </Badge>
        );
      case InventoryCheckStatus.BALANCED:
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900"
          >
            Đã cân bằng
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get editing stats
  const stats = isEditing
    ? calculateTotals()
    : {
        totalDifference: selectedCheck?.totalDifference || 0,
        totalIncrease: selectedCheck?.totalIncrease || 0,
        totalDecrease: selectedCheck?.totalDecrease || 0,
      };

  return (
    <>
      <Dialog open={open} onOpenChange={isEditing ? undefined : onOpenChange}>
        <DialogContent
          className={`sm:max-w-[900px] max-h-[90vh] flex flex-col ${isEditing ? "[&>button]:hidden" : ""}`}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-primary" />
              {isEditing
                ? "Chỉnh sửa phiếu kiểm kho"
                : "Chi tiết phiếu kiểm kho"}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Cập nhật số lượng thực tế và ghi chú cho phiếu kiểm kho"
                : "Thông tin chi tiết về phiếu kiểm kho và các mặt hàng được kiểm kê"}
            </DialogDescription>
          </DialogHeader>

          {isLoading || !selectedCheck ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs
              defaultValue="overview"
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="overview" disabled={isEditing}>
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="items">Danh sách mặt hàng</TabsTrigger>
              </TabsList>

              <TabsContent
                value="overview"
                className="flex-1 overflow-auto mt-0"
              >
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          Thông tin phiếu
                        </h3>
                        <div className="grid grid-cols-[120px_1fr] gap-2 text-sm">
                          <div className="text-muted-foreground">Mã phiếu:</div>
                          <div className="font-medium">
                            {selectedCheck.checkCode}
                          </div>

                          <div className="text-muted-foreground">Ngày tạo:</div>
                          <div>{formatDate(selectedCheck.createdAt)}</div>

                          <div className="text-muted-foreground">
                            Ngày cân bằng:
                          </div>
                          <div>
                            {selectedCheck.balanceDate
                              ? formatDate(selectedCheck.balanceDate)
                              : "Chưa cân bằng"}
                          </div>

                          <div className="text-muted-foreground">
                            Trạng thái:
                          </div>
                          <div>
                            {getStatusBadge(
                              selectedCheck.status as InventoryCheckStatus,
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-1">Ghi chú</h3>
                        <div className="p-4 rounded-md border bg-muted/30 min-h-[100px] shadow-sm">
                          {selectedCheck.note ? (
                            <p className="whitespace-pre-wrap">
                              {selectedCheck.note}
                            </p>
                          ) : (
                            <p className="text-muted-foreground italic">
                              Không có ghi chú
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold mb-1">
                        Thống kê chênh lệch
                      </h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30">
                          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                            Tổng chênh lệch
                          </div>
                          <div className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                            {stats.totalDifference > 0 ? "+" : ""}
                            {stats.totalDifference}
                          </div>
                        </div>

                        <div className="p-4 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/30">
                          <div className="text-sm text-green-600 dark:text-green-400 mb-1">
                            Lệch tăng
                          </div>
                          <div className="text-xl font-semibold text-green-700 dark:text-green-300">
                            +{stats.totalIncrease}
                          </div>
                        </div>

                        <div className="p-4 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30">
                          <div className="text-sm text-red-600 dark:text-red-400 mb-1">
                            Lệch giảm
                          </div>
                          <div className="text-xl font-semibold text-red-700 dark:text-red-300">
                            {stats.totalDecrease}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">
                          Thông tin kiểm kê
                        </h3>
                        <div className="space-y-2 border rounded-md p-4 bg-muted/30">
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">
                              Tổng số mặt hàng
                            </span>
                            <span className="font-medium">
                              {selectedCheck.items.length}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">
                              Số mặt hàng chênh lệch
                            </span>
                            <span className="font-medium">
                              {
                                selectedCheck.items.filter(
                                  (item) => item.difference !== 0,
                                ).length
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="items"
                className="flex-1 overflow-hidden mt-0"
              >
                {isEditing && (
                  <div className="mb-4">
                    <h3 className="text-base font-medium mb-2">Ghi chú</h3>
                    <Textarea
                      value={editedNote}
                      onChange={(e) => setEditedNote(e.target.value)}
                      placeholder="Nhập ghi chú về đợt kiểm kho (không bắt buộc)"
                      rows={2}
                    />
                  </div>
                )}

                <ScrollArea className="h-[400px] rounded-md border">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead className="w-[180px]">Mã hàng hoá</TableHead>
                        <TableHead>Tên hàng hoá</TableHead>
                        <TableHead className="text-center">Đơn vị</TableHead>
                        <TableHead className="text-right">
                          Tồn hệ thống
                        </TableHead>
                        <TableHead className="text-right">
                          Tồn thực tế
                        </TableHead>
                        <TableHead className="text-right">Chênh lệch</TableHead>
                        {isEditing && <TableHead className="w-20"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(isEditing ? editedItems : selectedCheck.items)
                        .length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={isEditing ? 7 : 6}
                            className="h-24 text-center"
                          >
                            Không có mặt hàng nào trong phiếu kiểm kê
                          </TableCell>
                        </TableRow>
                      ) : (
                        (isEditing ? editedItems : selectedCheck.items).map(
                          (item, index) => (
                            <TableRow
                              key={index}
                              className={
                                item.difference !== 0
                                  ? "bg-amber-50/50 dark:bg-amber-950/20"
                                  : ""
                              }
                            >
                              <TableCell className="font-medium">
                                {item.inventoryCode}
                              </TableCell>
                              <TableCell>{item.name}</TableCell>
                              <TableCell className="text-center">
                                {item.unit}
                              </TableCell>
                              <TableCell className="text-right">
                                {item.systemStock}
                              </TableCell>
                              <TableCell className="text-right">
                                {isEditing &&
                                editingItemId === item.inventoryItemId ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <Input
                                      type="number"
                                      value={item.actualStock}
                                      onChange={(e) =>
                                        handleUpdateActualStock(
                                          item.inventoryItemId,
                                          e.target.value,
                                        )
                                      }
                                      className="w-20 h-8 text-right"
                                      min="0"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={handleCancelEditingItem}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : isEditing ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="text-right block w-16">
                                      {item.actualStock}
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        handleStartEditingItem(
                                          item.inventoryItemId,
                                        )
                                      }
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                ) : (
                                  item.actualStock
                                )}
                              </TableCell>
                              <TableCell
                                className={`text-right font-medium ${
                                  item.difference > 0
                                    ? "text-green-600 dark:text-green-400"
                                    : item.difference < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : ""
                                }`}
                              >
                                {item.difference > 0 ? "+" : ""}
                                {item.difference}
                              </TableCell>
                              {isEditing && <TableCell></TableCell>}
                            </TableRow>
                          ),
                        )
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>

                {isEditing && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-4">
                    <div className="rounded-md border px-4 py-3 bg-muted/20">
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Tổng chênh lệch
                      </h3>
                      <p
                        className={`mt-1 text-lg font-semibold ${
                          stats.totalDifference > 0
                            ? "text-green-600 dark:text-green-400"
                            : stats.totalDifference < 0
                              ? "text-red-600 dark:text-red-400"
                              : ""
                        }`}
                      >
                        {stats.totalDifference > 0 ? "+" : ""}
                        {stats.totalDifference}
                      </p>
                    </div>
                    <div className="rounded-md border px-4 py-3 bg-green-50 dark:bg-green-950/20">
                      <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
                        Số lượng lệch tăng
                      </h3>
                      <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                        {stats.totalIncrease > 0
                          ? `+${stats.totalIncrease}`
                          : "0"}
                      </p>
                    </div>
                    <div className="rounded-md border px-4 py-3 bg-red-50 dark:bg-red-950/20">
                      <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                        Số lượng lệch giảm
                      </h3>
                      <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
                        {stats.totalDecrease < 0 ? stats.totalDecrease : "0"}
                      </p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleEditCancel}
                  disabled={isSaving}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
                <Button onClick={handleEditSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCloseDialog}>
                  Đóng
                </Button>
                {selectedCheck && (
                  <>
                    {selectedCheck.status === InventoryCheckStatus.DRAFT && (
                      <>
                        <Button variant="outline" onClick={handleEditStart}>
                          <ClipboardEdit className="h-4 w-4 mr-2" />
                          Chỉnh sửa
                        </Button>
                        <Button onClick={handleOpenBalanceDialog}>
                          <FileCheck2 className="h-4 w-4 mr-2" />
                          Cân bằng kho
                        </Button>
                      </>
                    )}
                    <Button
                      variant="destructive"
                      onClick={handleOpenDeleteDialog}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </Button>
                  </>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận cân bằng kho */}
      <AlertDialog open={showBalanceDialog} onOpenChange={setShowBalanceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              Xác nhận cân bằng kho
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ cân bằng kho dựa trên số liệu kiểm kê và không
              thể hoàn tác. Số lượng tồn kho sẽ được cập nhật theo số liệu thực
              tế.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBalancing}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleBalance();
              }}
              disabled={isBalancing}
            >
              {isBalancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận cân bằng"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xác nhận xóa phiếu */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Xác nhận xóa phiếu kiểm kho
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiếu kiểm kho này? Hành động này không
              thể hoàn tác.
              {selectedCheck?.status === InventoryCheckStatus.BALANCED && (
                <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      Cảnh báo
                    </p>
                    <p className="text-amber-700 dark:text-amber-400">
                      Phiếu kiểm kho này đã được cân bằng
                    </p>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white font-medium"
            >
              {isDeleting ? (
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
