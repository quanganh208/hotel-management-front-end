export type ItemType = "beverage" | "food" | "amenity" | "equipment" | "other";

export interface InventoryItem {
  _id: string;
  inventoryCode: string;
  name: string;
  unit: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  itemType: ItemType;
  description?: string;
  image?: string;
  hotelId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categoryCount: number;
}

export interface InventoryResponse {
  totalItems: number;
  totalValue: number;
  lowStockItems: number;
  categoryCount: number;
  items: InventoryItem[];
}
