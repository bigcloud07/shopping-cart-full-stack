export interface CartItem {
  productId: number;
  productName: string;
  productImg: string;
  productPrice: number;
  quantity: number;
}

export interface cartItemResponse {
  result: string;
  data: {
    cartItems: CartItem[];
  };
}
