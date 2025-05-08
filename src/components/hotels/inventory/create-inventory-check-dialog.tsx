"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  Search,
  X,
  ClipboardCheck,
  AlertTriangle,
  AlertCircle,
  Pencil,
  Save,
} from "lucide-react";
import { useInventoryStore } from "@/store";
import { useInventoryCheckStore } from "@/store/inventory-check";
import { toast } from "sonner";
import {
  InventoryItem,
  InventoryCheckItem,
  CreateInventoryCheckData,
} from "@/types/inventory";
import { useDebounce } from "@/hooks/use-debounce";

interface CreateInventoryCheckDialogProps {
  hotelId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateInventoryCheckDialog({
  hotelId,
  open,
  onOpenChange,
}: CreateInventoryCheckDialogProps) {
  const { searchResults, searchInventory, isSearching, fetchInventory } =
    useInventoryStore();
  const { createInventoryCheck, isLoading } = useInventoryCheckStore();

  // Form states
  const [searchTerm, setSearchTerm] = useState("");
  const [note, setNote] = useState("");
  const [selectedItems, setSelectedItems] = useState<InventoryCheckItem[]>([]);
  const [editedItems, setEditedItems] = useState<Record<string, number>>({});

  // Sử dụng debounce để tránh gọi API quá nhiều lần
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Tải danh sách hàng hoá khi dialog mở
  useEffect(() => {
    if (open && hotelId) {
      fetchInventory(hotelId);
      resetForm();
    }
  }, [open, hotelId, fetchInventory]);

  // Gọi API tìm kiếm khi searchTerm thay đổi
  useEffect(() => {
    if (debouncedSearchTerm && debouncedSearchTerm.length >= 2 && hotelId) {
      searchInventory(hotelId, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, hotelId, searchInventory]);

  // Reset form khi đóng dialog
  const resetForm = () => {
    setNote("");
    setSearchTerm("");
    setSelectedItems([]);
    setEditedItems({});
  };

  // Thêm sản phẩm vào danh sách kiểm kho
  const addItemToCheck = (item: InventoryItem) => {
    // Kiểm tra nếu sản phẩm đã được thêm rồi
    if (
      selectedItems.some((selected) => selected.inventoryItemId === item._id)
    ) {
      toast.error("Sản phẩm này đã được thêm vào danh sách");
      return;
    }

    // Thêm sản phẩm vào danh sách
    const newItem: InventoryCheckItem = {
      inventoryItemId: item._id,
      inventoryCode: item.inventoryCode,
      name: item.name,
      unit: item.unit,
      systemStock: item.stock,
      actualStock: item.stock, // Mặc định số lượng thực tế bằng số trong hệ thống
      difference: 0, // Chênh lệch ban đầu là 0
    };

    setSelectedItems((prev) => [...prev, newItem]);
  };

  // Xoá sản phẩm khỏi danh sách
  const removeItemFromCheck = (inventoryItemId: string) => {
    setSelectedItems((prev) =>
      prev.filter((item) => item.inventoryItemId !== inventoryItemId),
    );

    // Xoá khỏi danh sách chỉnh sửa nếu có
    if (editedItems[inventoryItemId]) {
      const newEditedItems = { ...editedItems };
      delete newEditedItems[inventoryItemId];
      setEditedItems(newEditedItems);
    }
  };

  // Bắt đầu chỉnh sửa số lượng thực tế của một sản phẩm
  const startEditing = (inventoryItemId: string, actualStock: number) => {
    setEditedItems({
      ...editedItems,
      [inventoryItemId]: actualStock,
    });
  };

  // Huỷ chỉnh sửa số lượng
  const cancelEditing = (inventoryItemId: string) => {
    const newEditedItems = { ...editedItems };
    delete newEditedItems[inventoryItemId];
    setEditedItems(newEditedItems);
  };

  // Cập nhật số lượng thực tế
  const updateActualStock = (inventoryItemId: string, value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setEditedItems({
        ...editedItems,
        [inventoryItemId]: numValue,
      });
    }
  };

  // Lưu số lượng thực tế được chỉnh sửa
  const saveActualStock = (inventoryItemId: string) => {
    const updatedItems = selectedItems.map((item) => {
      if (item.inventoryItemId === inventoryItemId) {
        const newActualStock = editedItems[inventoryItemId];
        return {
          ...item,
          actualStock: newActualStock,
          difference: newActualStock - item.systemStock,
        };
      }
      return item;
    });

    setSelectedItems(updatedItems);

    // Xoá khỏi danh sách đang chỉnh sửa
    const newEditedItems = { ...editedItems };
    delete newEditedItems[inventoryItemId];
    setEditedItems(newEditedItems);
  };

  // Tính tổng chênh lệch
  const totalDifference = selectedItems.reduce(
    (sum, item) => sum + item.difference,
    0,
  );

  // Tính số lượng lệch tăng
  const totalIncrease = selectedItems
    .filter((item) => item.difference > 0)
    .reduce((sum, item) => sum + item.difference, 0);

  // Tính số lượng lệch giảm
  const totalDecrease = selectedItems
    .filter((item) => item.difference < 0)
    .reduce((sum, item) => sum + item.difference, 0);

  // Xử lý khi thay đổi search term
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Tạo phiếu kiểm kho
  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng thêm ít nhất một sản phẩm vào phiếu kiểm kho");
      return;
    }

    try {
      const data: CreateInventoryCheckData = {
        hotelId: hotelId,
        items: selectedItems,
        note: note || undefined,
      };

      await createInventoryCheck(data);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating inventory check:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Tạo phiếu kiểm kho mới
          </DialogTitle>
          <DialogDescription>
            Thêm sản phẩm và nhập số lượng thực tế để tạo phiếu kiểm kho
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="note" className="text-sm">
              Ghi chú
            </Label>
            <Textarea
              id="note"
              placeholder="Nhập ghi chú về đợt kiểm kho này"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Tìm kiếm sản phẩm */}
          <div className="space-y-4">
            <h3 className="text-base font-medium">Thêm sản phẩm vào phiếu</h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Nhập tên hoặc mã sản phẩm để tìm kiếm..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Danh sách kết quả tìm kiếm */}
            {searchTerm && (
              <div className="border rounded-md overflow-hidden max-h-40 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-medium">Mã hàng</TableHead>
                      <TableHead className="font-medium">Tên hàng</TableHead>
                      <TableHead className="font-medium">Đơn vị</TableHead>
                      <TableHead className="font-medium text-right">
                        Tồn kho
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isSearching ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : searchResults.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">
                          {searchTerm.length < 2
                            ? "Nhập ít nhất 2 ký tự để tìm kiếm"
                            : "Không tìm thấy sản phẩm"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      searchResults.map((item) => {
                        const isSelected = selectedItems.some(
                          (selected) => selected.inventoryItemId === item._id,
                        );
                        return (
                          <TableRow
                            key={item._id}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-blue-50 dark:bg-blue-950/30"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => !isSelected && addItemToCheck(item)}
                          >
                            <TableCell className="font-medium">
                              {item.inventoryCode}
                            </TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.unit}</TableCell>
                            <TableCell className="text-right">
                              {item.stock}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* Danh sách sản phẩm đã chọn */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">
                Danh sách sản phẩm kiểm kê
              </h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                Tổng số: {selectedItems.length} sản phẩm
              </div>
            </div>

            {selectedItems.length === 0 ? (
              <div className="border rounded-md flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
                <h4 className="text-base font-medium mb-1">Chưa có sản phẩm</h4>
                <p className="text-sm text-muted-foreground">
                  Tìm kiếm và thêm sản phẩm vào phiếu kiểm kho
                </p>
              </div>
            ) : (
              <>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-medium">Mã hàng</TableHead>
                        <TableHead className="font-medium">Tên hàng</TableHead>
                        <TableHead className="font-medium">Đơn vị</TableHead>
                        <TableHead className="font-medium text-right">
                          SL hệ thống
                        </TableHead>
                        <TableHead className="font-medium text-right">
                          SL thực tế
                        </TableHead>
                        <TableHead className="font-medium text-right">
                          Chênh lệch
                        </TableHead>
                        <TableHead className="font-medium w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedItems.map((item) => (
                        <TableRow key={item.inventoryItemId}>
                          <TableCell className="font-medium">
                            {item.inventoryCode}
                          </TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell className="text-right">
                            {item.systemStock}
                          </TableCell>
                          <TableCell>
                            {editedItems[item.inventoryItemId] !== undefined ? (
                              <div className="flex items-center justify-end gap-1">
                                <Input
                                  type="number"
                                  value={editedItems[item.inventoryItemId]}
                                  onChange={(e) =>
                                    updateActualStock(
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
                                  onClick={() =>
                                    saveActualStock(item.inventoryItemId)
                                  }
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    cancelEditing(item.inventoryItemId)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-right block w-16">
                                  {item.actualStock}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    startEditing(
                                      item.inventoryItemId,
                                      item.actualStock,
                                    )
                                  }
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </div>
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
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeItemFromCheck(item.inventoryItemId)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Thông tin tổng hợp */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-md border px-4 py-3 bg-muted/20">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Tổng chênh lệch
                    </h3>
                    <p
                      className={`mt-1 text-lg font-semibold ${
                        totalDifference > 0
                          ? "text-green-600 dark:text-green-400"
                          : totalDifference < 0
                            ? "text-red-600 dark:text-red-400"
                            : ""
                      }`}
                    >
                      {totalDifference > 0 ? "+" : ""}
                      {totalDifference}
                    </p>
                  </div>
                  <div className="rounded-md border px-4 py-3 bg-green-50 dark:bg-green-950/20">
                    <h3 className="text-sm font-medium text-green-700 dark:text-green-300">
                      Số lượng lệch tăng
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-green-600 dark:text-green-400">
                      {totalIncrease > 0 ? `+${totalIncrease}` : "0"}
                    </p>
                  </div>
                  <div className="rounded-md border px-4 py-3 bg-red-50 dark:bg-red-950/20">
                    <h3 className="text-sm font-medium text-red-700 dark:text-red-300">
                      Số lượng lệch giảm
                    </h3>
                    <p className="mt-1 text-lg font-semibold text-red-600 dark:text-red-400">
                      {totalDecrease < 0 ? totalDecrease : "0"}
                    </p>
                  </div>
                </div>

                {/* Cảnh báo */}
                {totalDifference !== 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/40 rounded-md p-4 flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                        Lưu ý về chênh lệch tồn kho
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        Phiếu kiểm kho này có sự chênh lệch giữa số lượng thực
                        tế và số lượng trong hệ thống. Khi cân bằng kho, hệ
                        thống sẽ điều chỉnh tồn kho theo số lượng thực tế.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(editedItems).length > 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              "Tạo phiếu kiểm kho"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
