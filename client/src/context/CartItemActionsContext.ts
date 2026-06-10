import { createContext, useContext } from "react";

interface CartItemActions {
  onPlus: (productId: number) => Promise<void>;
  onMinus: (productId: number) => Promise<void>;
  onSelectItem: (productId: number) => void;
  onDelete: (productId: number) => void;
}

export const CartItemActionsContext = createContext<CartItemActions | null>(
  null,
);

export const useCartItemActions = (): CartItemActions => {
  const context = useContext(CartItemActionsContext);
  if (!context) {
    throw new Error(
      "useCartItemActions는 CartItemActionsContext.Provider 내부에서만 사용할 수 있습니다.",
    );
  }
  return context;
};
