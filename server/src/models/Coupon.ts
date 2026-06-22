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

export default class Coupon {
  constructor(private readonly coupon: CouponData) {}

  get data(): CouponData {
    return this.coupon;
  }

  get code(): CouponCode {
    return this.coupon.code;
  }

  getUnavailableReason(context: CouponContext): string | null {
    if (this.#isExpired(context.now)) {
      return "만료된 쿠폰입니다.";
    }

    if (
      (this.coupon.discountType === "fixed" ||
        this.coupon.discountType === "freeShipping") &&
      context.orderAmount < this.coupon.minimumAmount
    ) {
      return "최소 주문 금액을 충족하지 못했습니다.";
    }

    if (
      this.coupon.discountType === "bogo" &&
      this.#findBogoTarget(context.orderItems) === null
    ) {
      return "2+1 쿠폰을 적용할 수 있는 상품이 없습니다.";
    }

    if (
      this.coupon.discountType === "percentage" &&
      !this.#isWithinAvailableTime(context.now)
    ) {
      return "쿠폰 적용 시간이 아닙니다.";
    }

    return null;
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

    if (this.coupon.discountType === "fixed") {
      return this.#toProductDiscount(
        Math.min(this.coupon.discountAmount, currentProductAmount),
      );
    }

    if (this.coupon.discountType === "bogo") {
      const bogoTarget = this.#findBogoTarget(context.orderItems);
      if (!bogoTarget) return null;

      const bundleSize = this.coupon.buyQuantity + this.coupon.getQuantity;
      const freeQuantity =
        Math.floor(bogoTarget.quantity / bundleSize) * this.coupon.getQuantity;

      return this.#toProductDiscount(
        Math.min(bogoTarget.productPrice * freeQuantity, currentProductAmount),
      );
    }

    if (this.coupon.discountType === "percentage") {
      const rate =
        this.coupon.discountRate > 1
          ? this.coupon.discountRate / 100
          : this.coupon.discountRate;
      return this.#toProductDiscount(Math.floor(currentProductAmount * rate));
    }

    return null;
  }

  calculateShippingDiscount(
    context: CouponContext,
    shippingFee: number,
  ): CouponDiscount | null {
    if (
      this.coupon.discountType !== "freeShipping" ||
      !this.isAvailable(context) ||
      shippingFee <= 0
    ) {
      return null;
    }

    return {
      code: this.coupon.code,
      description: this.coupon.description,
      discountAmount: shippingFee,
      target: "shipping",
    };
  }

  #toProductDiscount(discountAmount: number): CouponDiscount | null {
    if (discountAmount <= 0) {
      return null;
    }

    return {
      code: this.coupon.code,
      description: this.coupon.description,
      discountAmount,
      target: "product",
    };
  }

  #findBogoTarget(orderItems: OrderLine[]): OrderLine | null {
    if (this.coupon.discountType !== "bogo") {
      return null;
    }

    const bundleSize = this.coupon.buyQuantity + this.coupon.getQuantity;
    return (
      orderItems
        .filter(orderItem => orderItem.quantity >= bundleSize)
        .sort((a, b) => b.productPrice - a.productPrice)[0] ?? null
    );
  }

  #isExpired(now: Date): boolean {
    const expirationTime = new Date(
      `${this.coupon.expirationDate}T23:59:59`,
    ).getTime();
    return expirationTime < now.getTime();
  }

  #isWithinAvailableTime(now: Date): boolean {
    if (this.coupon.discountType !== "percentage") {
      return true;
    }

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = this.#toMinutes(this.coupon.availableTime.start);
    const endMinutes = this.#toMinutes(this.coupon.availableTime.end);

    return startMinutes <= currentMinutes && currentMinutes < endMinutes;
  }

  #toMinutes(time: string): number {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
