export interface CartItem {
  productId: number;
  productName: string;
  productImg: string;
  productPrice: number;
  quantity: number;
}

export interface CartItemResponse {
  result: string;
  data: {
    cartItems: CartItem[];
  };
}
