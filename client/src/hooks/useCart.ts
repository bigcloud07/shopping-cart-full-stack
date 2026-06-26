import { useEffect, useState } from "react";
import type { CartItem, CartItemResponse } from "../type/type";
import { API_URL } from "../config";

interface UseCartReturn {
  cartItems: CartItem[];
  isLoading: boolean;
  isMutating: boolean;
  loadError: Error | null;
  mutationError: CartMutationError | null;
  refetch: () => Promise<void>;
  increaseQuantity: (productId: number) => Promise<QuantityChangeResult>;
  decreaseQuantity: (productId: number) => Promise<QuantityChangeResult>;
  removeItem: (productId: number) => Promise<void>;
}

type QuantityChangeResult =
  | { status: "success" }
  | { status: "blocked"; reason: "MIN_QUANTITY" | "MAX_QUANTITY" }
  | { status: "failed" };

interface CartMutationError {
  productId: number;
  message: string;
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

const MIN_QUANTITY = 1;
const MAX_QUANTITY = 99;

export const useCart = (): UseCartReturn => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMutationCount, setPendingMutationCount] = useState(0);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [mutationError, setMutationError] =
    useState<CartMutationError | null>(null);

  const refetch = async () => {
    try {
      setCartItems(await requestCartItems());
      setLoadError(null);
    } catch (err) {
      setLoadError(toError(err));
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        setCartItems(await requestCartItems());
        setLoadError(null);
      } catch (err) {
        setLoadError(toError(err));
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

  const rollbackCartItems = (
    previousCartItems: CartItem[],
    productId: number,
    message: string,
  ) => {
    setCartItems(previousCartItems);
    setMutationError({ productId, message });
  };

  const optimisticMutate = async <T,>({
    productId,
    applyOptimisticUpdate,
    request,
    rollbackMessage,
    onSuccess,
    onFailure,
  }: {
    productId: number;
    applyOptimisticUpdate: (items: CartItem[]) => CartItem[];
    request: () => Promise<Response>;
    rollbackMessage: string;
    onSuccess: () => T;
    onFailure: () => T;
  }): Promise<T> => {
    const previousCartItems = cartItems;

    setCartItems(applyOptimisticUpdate);
    setPendingMutationCount((count) => count + 1);
    setMutationError(null);

    try {
      const res = await request();
      if (!res.ok) {
        throw new Error(rollbackMessage);
      }
      return onSuccess();
    } catch {
      rollbackCartItems(previousCartItems, productId, rollbackMessage);
      return onFailure();
    } finally {
      setPendingMutationCount((count) => Math.max(0, count - 1));
    }
  };

  const increaseQuantity = async (
    productId: number,
  ): Promise<QuantityChangeResult> => {
    const current = cartItems.find((item) => item.productId === productId);
    if (!current) {
      return { status: "success" };
    }

    const nextQuantity = current.quantity + 1;
    if (nextQuantity > MAX_QUANTITY) {
      return { status: "blocked", reason: "MAX_QUANTITY" };
    }

    return optimisticMutate<QuantityChangeResult>({
      productId,
      applyOptimisticUpdate: (items) =>
        items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
      request: () => patchQuantity(productId, nextQuantity),
      rollbackMessage: "수량 변경에 실패했습니다.",
      onSuccess: () => ({ status: "success" }),
      onFailure: () => ({ status: "failed" }),
    });
  };

  const decreaseQuantity = async (
    productId: number,
  ): Promise<QuantityChangeResult> => {
    const current = cartItems.find((item) => item.productId === productId);
    if (!current) {
      return { status: "success" };
    }

    const nextQuantity = current.quantity - 1;
    if (nextQuantity < MIN_QUANTITY) {
      return { status: "blocked", reason: "MIN_QUANTITY" };
    }

    return optimisticMutate<QuantityChangeResult>({
      productId,
      applyOptimisticUpdate: (items) =>
        items.map((item) =>
          item.productId === productId
            ? { ...item, quantity: nextQuantity }
            : item,
        ),
      request: () => patchQuantity(productId, nextQuantity),
      rollbackMessage: "수량 변경에 실패했습니다.",
      onSuccess: () => ({ status: "success" }),
      onFailure: () => ({ status: "failed" }),
    });
  };

  const removeItem = async (productId: number) => {
    await optimisticMutate<void>({
      productId,
      applyOptimisticUpdate: (items) =>
        items.filter((item) => item.productId !== productId),
      request: () =>
        fetch(`${API_URL}/cart/${productId}`, {
          method: "DELETE",
        }),
      rollbackMessage: "상품 삭제에 실패했습니다.",
      onSuccess: () => undefined,
      onFailure: () => undefined,
    });
  };

  return {
    cartItems,
    isLoading,
    isMutating: pendingMutationCount > 0,
    loadError,
    mutationError,
    refetch,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  };
};
