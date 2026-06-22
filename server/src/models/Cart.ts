import type { ProductData } from "./Product.js";

export interface CartItem {
  productData: ProductData;
  quantity: number;
}

export interface CartRecord {
  productId: number;
  quantity: number;
  productData?: ProductData;
}

export interface CartItemResponse {
  productId: number;
  productName: string;
  productImg?: string;
  productPrice: number;
  quantity: number;
}
