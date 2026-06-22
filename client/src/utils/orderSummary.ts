import type {
  CartItem,
  CouponAvailability,
  CouponCode,
  CouponData,
  CouponDiscount,
  OrderSummaryData,
} from "../type/type";
import { calculateShippingFee } from "./shippingFee";

const formatWon = (amount: number) => `${amount.toLocaleString()}원`;

const DEFAULT_COUPONS: CouponData[] = [
  {
    id: 1,
    code: "FIXED5000",
    description: "5,000원 할인 쿠폰",
    expirationDate: "2026-11-30",
    discountType: "fixed",
    discountAmount: 5000,
    minimumAmount: 100000,
  },
  {
    id: 2,
    code: "BOGO",
    description: "2+1 쿠폰",
    expirationDate: "2026-06-30",
    discountType: "bogo",
    buyQuantity: 2,
    getQuantity: 1,
  },
  {
    id: 3,
    code: "FREESHIPPING",
    description: "무료 배송 쿠폰",
    expirationDate: "2026-08-31",
    discountType: "freeShipping",
    minimumAmount: 50000,
  },
  {
    id: 4,
    code: "MIRACLESALE",
    description: "30% 시간제 할인 쿠폰",
    expirationDate: "2026-07-31",
    discountType: "percentage",
    discountRate: 30,
    availableTime: { start: "04:00", end: "07:00" },
  },
];

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
  const shippingFee = calculateShippingFee(orderAmount, isRemoteArea);

  return {
    orderItems: items.map(toOrderLine),
    selectedCouponCodes: [],
    appliedCoupons: [],
    bestCouponCodes: [],
    price: {
      orderAmount,
      productDiscountAmount: 0,
      shippingFee,
      shippingDiscountAmount: 0,
      totalDiscountAmount: 0,
      finalPaymentAmount: orderAmount + shippingFee,
    },
    isRemoteArea,
  };
};

const getOrderAmount = (items: CartItem[]) =>
  items.reduce((total, item) => total + item.productPrice * item.quantity, 0);

const isExpired = (expirationDate: string, now: Date) => {
  return new Date(`${expirationDate}T23:59:59`).getTime() < now.getTime();
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isWithinAvailableTime = (
  availableTime: { start: string; end: string },
  now: Date,
) => {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return (
    toMinutes(availableTime.start) <= currentMinutes &&
    currentMinutes < toMinutes(availableTime.end)
  );
};

const findBogoTarget = (
  items: CartItem[],
  coupon: Extract<CouponData, { discountType: "bogo" }>,
) => {
  const bundleSize = coupon.buyQuantity + coupon.getQuantity;
  return (
    [...items]
      .filter((item) => item.quantity >= bundleSize)
      .sort((a, b) => b.productPrice - a.productPrice)[0] ?? null
  );
};

const getUnavailableReason = (
  coupon: CouponData,
  items: CartItem[],
  orderAmount: number,
  now: Date,
) => {
  if (isExpired(coupon.expirationDate, now)) {
    return "만료된 쿠폰입니다.";
  }

  if (
    (coupon.discountType === "fixed" ||
      coupon.discountType === "freeShipping") &&
    orderAmount < coupon.minimumAmount
  ) {
    return "최소 주문 금액을 충족하지 못했습니다.";
  }

  if (coupon.discountType === "bogo" && findBogoTarget(items, coupon) === null) {
    return "2+1 쿠폰을 적용할 수 있는 상품이 없습니다.";
  }

  if (
    coupon.discountType === "percentage" &&
    !isWithinAvailableTime(coupon.availableTime, now)
  ) {
    return "쿠폰 적용 시간이 아닙니다.";
  }

  return null;
};

const getExpectedDiscountAmount = (
  coupon: CouponData,
  items: CartItem[],
  orderAmount: number,
  shippingFee: number,
  now: Date,
) => {
  if (getUnavailableReason(coupon, items, orderAmount, now) !== null) {
    return 0;
  }

  if (coupon.discountType === "fixed") {
    return Math.min(coupon.discountAmount, orderAmount);
  }

  if (coupon.discountType === "freeShipping") {
    return shippingFee;
  }

  if (coupon.discountType === "percentage") {
    const rate =
      coupon.discountRate > 1 ? coupon.discountRate / 100 : coupon.discountRate;
    return Math.floor(orderAmount * rate);
  }

  if (coupon.discountType === "bogo") {
    const bogoTarget = findBogoTarget(items, coupon);
    if (!bogoTarget) return 0;

    const bundleSize = coupon.buyQuantity + coupon.getQuantity;
    const freeQuantity =
      Math.floor(bogoTarget.quantity / bundleSize) * coupon.getQuantity;

    return Math.min(bogoTarget.productPrice * freeQuantity, orderAmount);
  }

  return 0;
};

export const buildOptimisticCoupons = (
  items: CartItem[],
  isRemoteArea: boolean,
  now = new Date(),
) => {
  const orderAmount = getOrderAmount(items);
  const shippingFee = calculateShippingFee(orderAmount, isRemoteArea);
  const coupons = DEFAULT_COUPONS.map<CouponAvailability>((coupon) => {
    const unavailableReason = getUnavailableReason(
      coupon,
      items,
      orderAmount,
      now,
    );

    return {
      coupon,
      isAvailable: unavailableReason === null,
      unavailableReason,
      expectedDiscountAmount: getExpectedDiscountAmount(
        coupon,
        items,
        orderAmount,
        shippingFee,
        now,
      ),
    };
  });
  const bestCouponCodes = coupons
    .filter((coupon) => coupon.isAvailable)
    .sort((a, b) => b.expectedDiscountAmount - a.expectedDiscountAmount)
    .slice(0, 2)
    .map(({ coupon }) => coupon.code);

  return { coupons, bestCouponCodes };
};

const getDiscountTarget = (
  coupon: CouponAvailability,
): CouponDiscount["target"] =>
  coupon.coupon.discountType === "freeShipping" ? "shipping" : "product";

export const buildOptimisticCouponSummary = (
  summary: OrderSummaryData,
  coupons: CouponAvailability[],
  selectedCouponCodes: CouponCode[],
): OrderSummaryData => {
  const selectedCoupons = coupons.filter(
    ({ coupon, isAvailable }) =>
      isAvailable && selectedCouponCodes.includes(coupon.code),
  );
  const appliedCoupons = selectedCoupons.map<CouponDiscount>((coupon) => ({
    code: coupon.coupon.code,
    description: coupon.coupon.description,
    discountAmount: coupon.expectedDiscountAmount,
    target: getDiscountTarget(coupon),
  }));
  const productDiscountAmount = appliedCoupons
    .filter((coupon) => coupon.target === "product")
    .reduce((total, coupon) => total + coupon.discountAmount, 0);
  const shippingDiscountAmount = Math.min(
    summary.price.shippingFee,
    appliedCoupons
      .filter((coupon) => coupon.target === "shipping")
      .reduce((total, coupon) => total + coupon.discountAmount, 0),
  );
  const totalDiscountAmount = productDiscountAmount + shippingDiscountAmount;

  return {
    ...summary,
    selectedCouponCodes,
    appliedCoupons,
    price: {
      ...summary.price,
      productDiscountAmount,
      shippingDiscountAmount,
      totalDiscountAmount,
      finalPaymentAmount:
        summary.price.orderAmount -
        productDiscountAmount +
        summary.price.shippingFee -
        shippingDiscountAmount,
    },
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

export const enforceShippingPolicy = (
  summary: OrderSummaryData,
  isRemoteArea: boolean,
): OrderSummaryData => {
  const shippingFee = calculateShippingFee(
    summary.price.orderAmount,
    isRemoteArea,
  );
  const shippingDiscountAmount = Math.min(
    summary.price.shippingDiscountAmount,
    shippingFee,
  );
  const totalDiscountAmount =
    summary.price.productDiscountAmount + shippingDiscountAmount;

  return {
    ...summary,
    isRemoteArea,
    price: {
      ...summary.price,
      shippingFee,
      shippingDiscountAmount,
      totalDiscountAmount,
      finalPaymentAmount:
        summary.price.orderAmount -
        summary.price.productDiscountAmount +
        shippingFee -
        shippingDiscountAmount,
    },
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
