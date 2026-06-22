interface CouponBase {
  id: number;
  code: string;
  description: string;
  expirationDate: string;
}
export interface FixedCoupon extends CouponBase {
  discountType: "fixed";
  discountAmount: number;
  minimumAccount: number;
}
export interface BogoCoupon extends CouponBase {
  discountType: "bogo";
  buyQuantity: number;
  getQuantity: number;
}
export interface FreeShippingCoupon extends CouponBase {
  discountType: "freeShipping";
  minimumAccount: number;
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

export default class Coupon {}
