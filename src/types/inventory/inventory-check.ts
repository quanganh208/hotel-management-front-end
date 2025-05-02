// Enums
export enum InventoryCheckStatus {
  DRAFT = "draft", // Phiếu tạm
  BALANCED = "balanced", // Đã cân bằng kho
}

// Định nghĩa interface cho một mặt hàng trong phiếu kiểm kê
export interface InventoryCheckItem {
  inventoryItemId: string;
  inventoryCode: string;
  name: string;
  unit: string;
  systemStock: number;
  actualStock: number;
  difference: number;
}

// Định nghĩa interface cho phiếu kiểm kê
export interface InventoryCheck {
  _id: string;
  checkCode: string;
  hotelId: string;
  createdAt: string;
  updatedAt: string;
  balanceDate?: string;
  totalDifference: number;
  totalIncrease: number;
  totalDecrease: number;
  note?: string;
  status: InventoryCheckStatus | string;
  createdBy?: string;
  balancedBy?: string;
  items: InventoryCheckItem[];
}

// Interface cho việc tạo phiếu kiểm kê
export interface CreateInventoryCheckData {
  hotelId: string;
  note?: string;
  items: InventoryCheckItem[];
}
