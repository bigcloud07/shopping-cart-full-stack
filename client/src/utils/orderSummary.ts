import type {
  CartItem,
  CouponAvailability,
  OrderSummaryData,
} from "../type/type";

const formatWon = (amount: number) => `${amount.toLocaleString()}원`;

export const toOrderLine = (item: CartItem) => ({
  ...item,
  lineAmount: item.productPrice * item.quantity,
});

export const buildFallbackSummary = (
  items: CartItem[],
  isRemoteArea: boolean,
): OrderSummaryData => {
  const orderAmount = items.reduce(
    (total, item) => total + item.productPrice * item.quantity,
    0,
  );
  return {
    orderItems: items.map(toOrderLine),
    selectedCouponCodes: [],
    appliedCoupons: [],
    bestCouponCodes: [],
    price: {
      orderAmount,
      productDiscountAmount: 0,
      shippingFee: 0,
      shippingDiscountAmount: 0,
      totalDiscountAmount: 0,
      finalPaymentAmount: orderAmount,
    },
    isRemoteArea,
  };
};

export const alignSummaryItemOrder = (
  summary: OrderSummaryData,
  items: CartItem[],
): OrderSummaryData => {
  const orderByProductId = new Map(
    items.map((item, index) => [item.productId, index]),
  );

  return {
    ...summary,
    orderItems: [...summary.orderItems].sort(
      (a, b) =>
        (orderByProductId.get(a.productId) ?? Number.MAX_SAFE_INTEGER) -
        (orderByProductId.get(b.productId) ?? Number.MAX_SAFE_INTEGER),
    ),
  };
};

const parseCouponTime = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  const period = hour < 12 ? "오전" : "오후";
  const hour12 = hour % 12 || 12;

  return { period, hour: hour12, minute };
};

const formatCouponTime = (time: string): string => {
  const { period, hour, minute } = parseCouponTime(time);
  const minuteText = minute > 0 ? ` ${minute}분` : "";

  return `${period} ${hour}시${minuteText}`;
};

const formatCouponTimeRange = (start: string, end: string): string => {
  const startTime = parseCouponTime(start);
  const endTime = parseCouponTime(end);
  const endMinuteText = endTime.minute > 0 ? ` ${endTime.minute}분` : "";

  if (startTime.period === endTime.period) {
    return `${formatCouponTime(start)}부터 ${endTime.hour}시${endMinuteText}까지`;
  }

  return `${formatCouponTime(start)}부터 ${formatCouponTime(end)}까지`;
};

export const formatCouponDetail = ({ coupon }: CouponAvailability): string => {
  if (coupon.discountType === "fixed") {
    return `최소 주문 금액: ${formatWon(coupon.minimumAmount)}`;
  }

  if (coupon.discountType === "freeShipping") {
    return `최소 주문 금액: ${formatWon(coupon.minimumAmount)}`;
  }

  if (coupon.discountType === "percentage") {
    return `사용 가능 시간: ${formatCouponTimeRange(coupon.availableTime.start, coupon.availableTime.end)}`;
  }

  if (coupon.discountType === "bogo") {
    return `동일 상품 ${coupon.buyQuantity}개 구매 시 ${coupon.getQuantity}개 무료`;
  }

  return "";
};
