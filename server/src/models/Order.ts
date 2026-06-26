import Coupon, {
  type CouponCode,
  type CouponData,
  type CouponDiscount,
} from "./Coupon.js";

const FREE_SHIPPING_MINIMUM_AMOUNT = 100000;
const STANDARD_SHIPPING_FEE = 3000;
const REMOTE_AREA_SHIPPING_FEE = 3000;

export interface OrderLine {
  productId: number;
  productName: string;
  productImg?: string;
  productPrice: number;
  quantity: number;
  lineAmount: number;
}

export interface CouponAvailability {
  coupon: CouponData;
  isAvailable: boolean;
  unavailableReason: string | null;
  expectedDiscountAmount: number;
}

export interface OrderPrice {
  orderAmount: number;
  productDiscountAmount: number;
  shippingFee: number;
  shippingDiscountAmount: number;
  totalDiscountAmount: number;
  finalPaymentAmount: number;
}

export interface OrderSummary {
  orderItems: OrderLine[];
  selectedCouponCodes: CouponCode[];
  appliedCoupons: CouponDiscount[];
  bestCouponCodes: CouponCode[];
  price: OrderPrice;
  isRemoteArea: boolean;
}

export default class Order {
  constructor(
    private readonly orderItems: OrderLine[],
    private readonly isRemoteArea: boolean,
    private readonly now = new Date(),
  ) {}

  calculate(selectedCoupons: CouponData[] = []): OrderSummary {
    const orderedCoupons = this.#sortCouponsByApplicationOrder(selectedCoupons);
    const orderAmount = this.#getOrderAmount();
    const context = {
      orderAmount,
      orderItems: this.orderItems,
      now: this.now,
    };
    const shippingFee = this.#calculateShippingFee(orderAmount);
    let currentProductAmount = orderAmount;
    let productDiscountAmount = 0;
    let shippingDiscountAmount = 0;
    const appliedCoupons: CouponDiscount[] = [];

    for (const couponData of orderedCoupons) {
      const coupon = new Coupon(couponData);
      const productDiscount = coupon.calculateProductDiscount(
        context,
        currentProductAmount,
      );

      if (productDiscount) {
        productDiscountAmount += productDiscount.discountAmount;
        currentProductAmount -= productDiscount.discountAmount;
        appliedCoupons.push(productDiscount);
      }

      const shippingDiscount = coupon.calculateShippingDiscount(
        context,
        shippingFee - shippingDiscountAmount,
      );

      if (shippingDiscount) {
        shippingDiscountAmount += shippingDiscount.discountAmount;
        appliedCoupons.push(shippingDiscount);
      }
    }

    const totalDiscountAmount = productDiscountAmount + shippingDiscountAmount;

    return {
      orderItems: this.orderItems,
      selectedCouponCodes: selectedCoupons.map((coupon) => coupon.code),
      appliedCoupons,
      bestCouponCodes: [],
      price: {
        orderAmount,
        productDiscountAmount,
        shippingFee,
        shippingDiscountAmount,
        totalDiscountAmount,
        finalPaymentAmount:
          orderAmount -
          productDiscountAmount +
          shippingFee -
          shippingDiscountAmount,
      },
      isRemoteArea: this.isRemoteArea,
    };
  }

  getCouponAvailability(coupons: CouponData[]): CouponAvailability[] {
    return coupons.map((couponData) => {
      const coupon = new Coupon(couponData);
      const unavailableReason = coupon.getUnavailableReason({
        orderAmount: this.#getOrderAmount(),
        orderItems: this.orderItems,
        now: this.now,
      });

      return {
        coupon: couponData,
        isAvailable: unavailableReason === null,
        unavailableReason,
        expectedDiscountAmount: this.calculate([couponData]).price
          .totalDiscountAmount,
      };
    });
  }

  findBestCouponCodes(coupons: CouponData[]): CouponCode[] {
    const availableCoupons = coupons.filter((coupon) =>
      new Coupon(coupon).isAvailable({
        orderAmount: this.#getOrderAmount(),
        orderItems: this.orderItems,
        now: this.now,
      }),
    );
    const combinations = this.#createCouponCombinations(availableCoupons);

    return (
      combinations
        .map((selectedCoupons) => ({
          coupons: selectedCoupons,
          totalDiscountAmount:
            this.calculate(selectedCoupons).price.totalDiscountAmount,
        }))
        .sort((a, b) => b.totalDiscountAmount - a.totalDiscountAmount)[0]
        ?.coupons.map((coupon) => coupon.code) ?? []
    );
  }

  #getOrderAmount(): number {
    return this.orderItems.reduce(
      (total, orderItem) => total + orderItem.lineAmount,
      0,
    );
  }

  #calculateShippingFee(orderAmount: number): number {
    if (orderAmount >= FREE_SHIPPING_MINIMUM_AMOUNT) {
      return 0;
    }

    return (
      STANDARD_SHIPPING_FEE + (this.isRemoteArea ? REMOTE_AREA_SHIPPING_FEE : 0)
    );
  }

  #sortCouponsByApplicationOrder(coupons: CouponData[]): CouponData[] {
    return [...coupons].sort(
      (a, b) =>
        new Coupon(a).applicationOrder - new Coupon(b).applicationOrder,
    );
  }

  #createCouponCombinations(coupons: CouponData[]): CouponData[][] {
    const combinations: CouponData[][] = [[]];

    coupons.forEach((coupon, index) => {
      combinations.push([coupon]);

      for (
        let nextIndex = index + 1;
        nextIndex < coupons.length;
        nextIndex += 1
      ) {
        combinations.push([coupon, coupons[nextIndex]]);
      }
    });

    return combinations;
  }
}
