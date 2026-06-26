import type { OrderLine } from "./Order.js";

export type CouponCode =
  | "FIXED5000"
  | "BOGO"
  | "FREESHIPPING"
  | "MIRACLESALE";

interface CouponBase {
  id: number;
  code: CouponCode;
  description: string;
  expirationDate: string;
}

export interface FixedCoupon extends CouponBase {
  discountType: "fixed";
  discountAmount: number;
  minimumAmount: number;
}

export interface BogoCoupon extends CouponBase {
  discountType: "bogo";
  buyQuantity: number;
  getQuantity: number;
}

export interface FreeShippingCoupon extends CouponBase {
  discountType: "freeShipping";
  minimumAmount: number;
}

export interface PercentageCoupon extends CouponBase {
  discountType: "percentage";
  discountRate: number;
  availableTime: { start: string; end: string };
}
export type CouponData =
  | FixedCoupon
  | BogoCoupon
  | FreeShippingCoupon
  | PercentageCoupon;

export interface CouponContext {
  orderAmount: number;
  orderItems: OrderLine[];
  now: Date;
}

export type CouponDiscountTarget = "product" | "shipping";

export interface CouponDiscount {
  code: CouponCode;
  description: string;
  discountAmount: number;
  target: CouponDiscountTarget;
}

interface CouponPolicy<T extends CouponData> {
  applicationOrder: number;
  getUnavailableReason(coupon: T, context: CouponContext): string | null;
  calculateProductDiscount(
    coupon: T,
    context: CouponContext,
    currentProductAmount: number,
  ): CouponDiscount | null;
  calculateShippingDiscount(
    coupon: T,
    context: CouponContext,
    shippingFee: number,
  ): CouponDiscount | null;
}

export const DEFAULT_COUPONS: CouponData[] = [
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

const toProductDiscount = (
  coupon: CouponData,
  discountAmount: number,
): CouponDiscount | null => {
  if (discountAmount <= 0) {
    return null;
  }

  return {
    code: coupon.code,
    description: coupon.description,
    discountAmount,
    target: "product",
  };
};

const toShippingDiscount = (
  coupon: CouponData,
  discountAmount: number,
): CouponDiscount | null => {
  if (discountAmount <= 0) {
    return null;
  }

  return {
    code: coupon.code,
    description: coupon.description,
    discountAmount,
    target: "shipping",
  };
};

const findBogoTarget = (
  coupon: BogoCoupon,
  orderItems: OrderLine[],
): OrderLine | null => {
  const bundleSize = coupon.buyQuantity + coupon.getQuantity;
  return (
    orderItems
      .filter(orderItem => orderItem.quantity >= bundleSize)
      .sort((a, b) => b.productPrice - a.productPrice)[0] ?? null
  );
};

const toMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const isWithinAvailableTime = (
  coupon: PercentageCoupon,
  now: Date,
): boolean => {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = toMinutes(coupon.availableTime.start);
  const endMinutes = toMinutes(coupon.availableTime.end);

  return startMinutes <= currentMinutes && currentMinutes < endMinutes;
};

const fixedCouponPolicy: CouponPolicy<FixedCoupon> = {
  applicationOrder: 0,
  getUnavailableReason(coupon, context) {
    return context.orderAmount < coupon.minimumAmount
      ? "최소 주문 금액을 충족하지 못했습니다."
      : null;
  },
  calculateProductDiscount(coupon, _context, currentProductAmount) {
    return toProductDiscount(
      coupon,
      Math.min(coupon.discountAmount, currentProductAmount),
    );
  },
  calculateShippingDiscount() {
    return null;
  },
};

const bogoCouponPolicy: CouponPolicy<BogoCoupon> = {
  applicationOrder: 0,
  getUnavailableReason(coupon, context) {
    return findBogoTarget(coupon, context.orderItems) === null
      ? "2+1 쿠폰을 적용할 수 있는 상품이 없습니다."
      : null;
  },
  calculateProductDiscount(coupon, context, currentProductAmount) {
    const bogoTarget = findBogoTarget(coupon, context.orderItems);
    if (!bogoTarget) return null;

    const bundleSize = coupon.buyQuantity + coupon.getQuantity;
    const freeQuantity =
      Math.floor(bogoTarget.quantity / bundleSize) * coupon.getQuantity;

    return toProductDiscount(
      coupon,
      Math.min(bogoTarget.productPrice * freeQuantity, currentProductAmount),
    );
  },
  calculateShippingDiscount() {
    return null;
  },
};

const freeShippingCouponPolicy: CouponPolicy<FreeShippingCoupon> = {
  applicationOrder: 0,
  getUnavailableReason(coupon, context) {
    return context.orderAmount < coupon.minimumAmount
      ? "최소 주문 금액을 충족하지 못했습니다."
      : null;
  },
  calculateProductDiscount() {
    return null;
  },
  calculateShippingDiscount(coupon, _context, shippingFee) {
    return toShippingDiscount(coupon, shippingFee);
  },
};

const percentageCouponPolicy: CouponPolicy<PercentageCoupon> = {
  applicationOrder: 1,
  getUnavailableReason(coupon, context) {
    return isWithinAvailableTime(coupon, context.now)
      ? null
      : "쿠폰 적용 시간이 아닙니다.";
  },
  calculateProductDiscount(coupon, _context, currentProductAmount) {
    const rate =
      coupon.discountRate > 1
        ? coupon.discountRate / 100
        : coupon.discountRate;
    return toProductDiscount(coupon, Math.floor(currentProductAmount * rate));
  },
  calculateShippingDiscount() {
    return null;
  },
};

const couponPolicies = {
  fixed: fixedCouponPolicy,
  bogo: bogoCouponPolicy,
  freeShipping: freeShippingCouponPolicy,
  percentage: percentageCouponPolicy,
};

const getCouponPolicy = <T extends CouponData>(coupon: T): CouponPolicy<T> =>
  couponPolicies[coupon.discountType] as CouponPolicy<T>;

export default class Coupon {
  constructor(private readonly coupon: CouponData) {}

  get data(): CouponData {
    return this.coupon;
  }

  get code(): CouponCode {
    return this.coupon.code;
  }

  get applicationOrder(): number {
    return getCouponPolicy(this.coupon).applicationOrder;
  }

  getUnavailableReason(context: CouponContext): string | null {
    if (this.#isExpired(context.now)) {
      return "만료된 쿠폰입니다.";
    }

    return getCouponPolicy(this.coupon).getUnavailableReason(
      this.coupon,
      context,
    );
  }

  isAvailable(context: CouponContext): boolean {
    return this.getUnavailableReason(context) === null;
  }

  calculateProductDiscount(
    context: CouponContext,
    currentProductAmount: number,
  ): CouponDiscount | null {
    if (!this.isAvailable(context)) {
      return null;
    }

    return getCouponPolicy(this.coupon).calculateProductDiscount(
      this.coupon,
      context,
      currentProductAmount,
    );
  }

  calculateShippingDiscount(
    context: CouponContext,
    shippingFee: number,
  ): CouponDiscount | null {
    if (!this.isAvailable(context) || shippingFee <= 0) {
      return null;
    }

    return getCouponPolicy(this.coupon).calculateShippingDiscount(
      this.coupon,
      context,
      shippingFee,
    );
  }

  #isExpired(now: Date): boolean {
    const expirationTime = new Date(
      `${this.coupon.expirationDate}T23:59:59`,
    ).getTime();
    return expirationTime < now.getTime();
  }

}
