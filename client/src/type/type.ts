export interface CartItem {
  productId: number;
  productName: string;
  productImg: string;
  productPrice: number;
  quantity: number;
}

export interface CartItemResponse {
  result: string;
  data: {
    cartItems: CartItem[];
  };
}

export type CouponCode = string;

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

export interface CouponAvailability {
  coupon: CouponData;
  isAvailable: boolean;
  unavailableReason: string | null;
  expectedDiscountAmount: number;
}

export interface CouponDiscount {
  code: CouponCode;
  description: string;
  discountAmount: number;
  target: "product" | "shipping";
}

export interface OrderLine extends CartItem {
  lineAmount: number;
}

export interface OrderPrice {
  orderAmount: number;
  productDiscountAmount: number;
  shippingFee: number;
  shippingDiscountAmount: number;
  totalDiscountAmount: number;
  finalPaymentAmount: number;
}

export interface OrderSummaryData {
  orderItems: OrderLine[];
  selectedCouponCodes: CouponCode[];
  appliedCoupons: CouponDiscount[];
  bestCouponCodes: CouponCode[];
  price: OrderPrice;
  isRemoteArea: boolean;
}

export interface OrderSummaryResponse {
  result: string;
  data: OrderSummaryData;
}

export interface CouponListResponse {
  result: string;
  data: {
    coupons: CouponAvailability[];
    bestCouponCodes: CouponCode[];
  };
}
