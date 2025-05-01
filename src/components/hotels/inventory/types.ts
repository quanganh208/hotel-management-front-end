// Product related interfaces
export interface Product {
  _id: string;
  inventoryCode: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  description?: string;
  image?: string;
  itemType: ItemType;
  unit: string;
  hotelId: string;
  createdAt: string;
  updatedAt: string;
}

export type ItemType = "beverage" | "food" | "amenity" | "equipment" | "other";

export interface UpdateProductForm {
  inventoryCode: string;
  name: string;
  sellingPrice: number;
  costPrice: number;
  stockQuantity: number; // Keeping stockQuantity to match the UI form naming
  description: string;
  itemType: ItemType;
  unit: string;
  image: File | null;
}

export interface ProductFormErrors {
  inventoryCode: string;
  name: string;
  sellingPrice: string;
  costPrice: string;
  stockQuantity: string;
  itemType: string;
  unit: string;
  image: string;
}

export interface UpdateHistoryItem {
  date: string;
  action: string;
  user: string;
  details: string;
}
