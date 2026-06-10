import type { CartItem } from "../type/type";
import { calculateShippingFee } from "../utils/shippingFee";

interface UseOrderCalculationReturn {
  selectedItems: CartItem[];
  totalOrderAmount: number;
  totalQuantity: number;
  shippingFee: number;
  totalPaymentAmount: number;
}

export const useOrderCalculation = (
  cartItems: CartItem[],
  selectedIds: Set<number>,
): UseOrderCalculationReturn => {
  const selectedItems = cartItems.filter((item) =>
    selectedIds.has(item.productId),
  );

  const totalOrderAmount = selectedItems.reduce(
    (acc, item) => acc + item.productPrice * item.quantity,
    0,
  );

  const totalQuantity = selectedItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  );

  const shippingFee = calculateShippingFee(totalOrderAmount);
  const totalPaymentAmount = totalOrderAmount + shippingFee;

  return {
    selectedItems,
    totalOrderAmount,
    totalQuantity,
    shippingFee,
    totalPaymentAmount,
  };
};
