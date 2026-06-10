export const SHIPPING_FEE = 3000;
export const FREE_SHIPPING_THRESHOLD = 100000;

export const calculateShippingFee = (totalOrderAmount: number): number => {
  if (totalOrderAmount === 0 || totalOrderAmount >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_FEE;
};
