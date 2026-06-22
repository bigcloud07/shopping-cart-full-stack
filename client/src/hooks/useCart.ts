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
  const [pendingMutationCount, setPendingMutationCount] = useState(0);
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

  const patchQuantity = async (productId: number, quantity: number) => {
    return fetch(`${API_URL}/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
  };

  const rollbackCartItems = (previousCartItems: CartItem[], err: unknown) => {
    setCartItems(previousCartItems);
    setError(toError(err));
  };

  const increaseQuantity = async (productId: number, quantity: number) => {
    const nextQuantity = quantity + 1;
    const previousCartItems = cartItems;

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
    setPendingMutationCount((count) => count + 1);
    setError(null);

    try {
      const res = await patchQuantity(productId, nextQuantity);
      if (!res.ok) {
        throw new Error("수량 변경에 실패했습니다.");
      }
    } catch (err) {
      rollbackCartItems(previousCartItems, err);
    } finally {
      setPendingMutationCount((count) => Math.max(0, count - 1));
    }
  };

  const decreaseQuantity = async (productId: number, quantity: number) => {
    const nextQuantity = quantity - 1;
    if (nextQuantity < 1) {
      return false;
    }

    const previousCartItems = cartItems;

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: nextQuantity }
          : item,
      ),
    );
    setPendingMutationCount((count) => count + 1);
    setError(null);

    try {
      const res = await patchQuantity(productId, nextQuantity);
      if (res.status === 400) {
        setCartItems(previousCartItems);
        return false;
      }
      if (!res.ok) {
        throw new Error("수량 변경에 실패했습니다.");
      }
      return true;
    } catch (err) {
      rollbackCartItems(previousCartItems, err);
      return true;
    } finally {
      setPendingMutationCount((count) => Math.max(0, count - 1));
    }
  };

  const removeItem = async (productId: number) => {
    const previousCartItems = cartItems;

    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
    setPendingMutationCount((count) => count + 1);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/cart/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("상품 삭제에 실패했습니다.");
      }
    } catch (err) {
      rollbackCartItems(previousCartItems, err);
    } finally {
      setPendingMutationCount((count) => Math.max(0, count - 1));
    }
  };

  return {
    cartItems,
    isLoading,
    isMutating: pendingMutationCount > 0,
    error,
    refetch,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  };
};
