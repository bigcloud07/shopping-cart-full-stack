import { useEffect, useState } from "react";
import type { CartItem, CartItemResponse } from "../type/type";
import { API_URL } from "../config";

interface UseCartReturn {
  cartItems: CartItem[];
  isLoading: boolean;
  isMutating: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  increaseQuantity: (productId: number, quantity: number) => Promise<void>;
  decreaseQuantity: (productId: number, quantity: number) => Promise<boolean>;
  removeItem: (productId: number) => Promise<void>;
}

const requestCartItems = async (): Promise<CartItem[]> => {
  const response = await fetch(`${API_URL}/cart`);
  if (!response.ok) {
    throw new Error("장바구니 정보를 불러오지 못했습니다.");
  }
  const cartItemResponse: CartItemResponse = await response.json();
  return cartItemResponse.data.cartItems;
};

const toError = (err: unknown): Error =>
  err instanceof Error
    ? err
    : new Error("장바구니 정보를 불러오지 못했습니다.");

export const useCart = (): UseCartReturn => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setCartItems(await requestCartItems());
      setError(null);
    } catch (err) {
      setError(toError(err));
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
    if (isMutating) return;
    setIsMutating(true);
    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: quantity + 1 }),
      });
      if (!res.ok) {
        throw new Error("수량 변경에 실패했습니다.");
      }
      await refetch();
    } catch (err) {
      setError(toError(err));
    } finally {
      setIsMutating(false);
    }
  };

  const decreaseQuantity = async (productId: number, quantity: number) => {
    if (isMutating) return true;
    setIsMutating(true);
    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: quantity - 1 }),
      });
      if (res.status === 400) {
        return false;
      }
      if (!res.ok) {
        throw new Error("수량 변경에 실패했습니다.");
      }
      await refetch();
      return true;
    } catch (err) {
      setError(toError(err));
      return true;
    } finally {
      setIsMutating(false);
    }
  };

  const removeItem = async (productId: number) => {
    if (isMutating) return;
    setIsMutating(true);
    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("상품 삭제에 실패했습니다.");
      }
      await refetch();
    } catch (err) {
      setError(toError(err));
    } finally {
      setIsMutating(false);
    }
  };

  return {
    cartItems,
    isLoading,
    isMutating,
    error,
    refetch,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  };
};
