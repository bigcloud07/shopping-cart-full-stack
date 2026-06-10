import { useEffect, useState } from "react";
import type { CartItem, cartItemResponse } from "../type/type";
import { API_URL } from "../config";

interface UseCartReturn {
  cartItems: CartItem[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  increaseQuantity: (productId: number, quantity: number) => Promise<void>;
  decreaseQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<void>;
}

const requestCartItems = async (): Promise<CartItem[]> => {
  const response = await fetch(`${API_URL}/cart`);
  const cartItemResponse: cartItemResponse = await response.json();
  return cartItemResponse.data.cartItems;
};

const toError = (err: unknown): Error =>
  err instanceof Error ? err : new Error("장바구니 정보를 불러오지 못했습니다.");

export const useCart = (): UseCartReturn => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    setIsLoading(true);
    try {
      setCartItems(await requestCartItems());
      setError(null);
    } catch (err) {
      setError(toError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setCartItems(await requestCartItems());
        setError(null);
      } catch (err) {
        setError(toError(err));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const increaseQuantity = async (productId: number, quantity: number) => {
    await fetch(`${API_URL}/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: quantity + 1 }),
    });
    await refetch();
  };

  const decreaseQuantity = async (productId: number, quantity: number) => {
    const res = await fetch(`${API_URL}/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: quantity - 1 }),
    });
    if (res.status === 400) {
      return false;
    }
    await refetch();
    return true;
  };

  const removeItem = async (productId: number) => {
    await fetch(`${API_URL}/cart/${productId}`, {
      method: "DELETE",
    });
    await refetch();
  };

  return {
    cartItems,
    isLoading,
    error,
    refetch,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  };
};
