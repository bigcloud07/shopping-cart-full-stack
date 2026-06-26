import type { CartRecord } from "../models/Cart.js";
import type { ProductData } from "../models/Product.js";
import Order, {
  type CouponAvailability,
  type OrderLine,
  type OrderSummary,
} from "../models/Order.js";
import type { CouponCode, CouponData } from "../models/Coupon.js";
import type { CartRepository } from "../Repository/CartRepository.js";
import type { ProductRepository } from "../Repository/ProductRepository.js";
import type { CouponRepository } from "../Repository/CouponRepository.js";
import ServiceError from "./ServiceError.js";

export interface CouponListResponse {
  coupons: CouponAvailability[];
  bestCouponCodes: CouponCode[];
}

export default class OrderService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly productRepository: ProductRepository,
    private readonly couponRepository: CouponRepository,
  ) {}

  async createOrder(
    productIds: number[],
    isRemoteArea: boolean,
  ): Promise<OrderSummary> {
    const order = await this.#createOrderModel(productIds, isRemoteArea);
    return order.calculate();
  }

  async getCoupons(
    productIds: number[],
    isRemoteArea: boolean,
  ): Promise<CouponListResponse> {
    const order = await this.#createOrderModel(productIds, isRemoteArea);
    const coupons = await this.couponRepository.findAll();

    return {
      coupons: order.getCouponAvailability(coupons),
      bestCouponCodes: order.findBestCouponCodes(coupons),
    };
  }

  async applyCoupons(
    productIds: number[],
    isRemoteArea: boolean,
    selectedCouponCodes: CouponCode[],
  ): Promise<OrderSummary> {
    const order = await this.#createOrderModel(productIds, isRemoteArea);
    const coupons = await this.couponRepository.findAll();
    const selectedCoupons =
      this.#findSelectedCoupons(coupons, selectedCouponCodes);

    if (selectedCoupons.length !== selectedCouponCodes.length) {
      throw new ServiceError(400, "존재하지 않는 쿠폰이 포함되어 있습니다.");
    }

    const unavailableCoupon = order
      .getCouponAvailability(selectedCoupons)
      .find(coupon => !coupon.isAvailable);

    if (unavailableCoupon) {
      throw new ServiceError(
        400,
        unavailableCoupon.unavailableReason ?? "사용할 수 없는 쿠폰입니다.",
      );
    }

    const summary = order.calculate(
      this.#sortByRequestedOrder(selectedCoupons, selectedCouponCodes),
    );

    return {
      ...summary,
      bestCouponCodes: order.findBestCouponCodes(coupons),
    };
  }

  async #createOrderModel(
    productIds: number[],
    isRemoteArea: boolean,
  ): Promise<Order> {
    const orderItems = await this.#getOrderItems(productIds);

    if (orderItems.length === 0) {
      throw new ServiceError(400, "주문할 상품이 없습니다.");
    }

    return new Order(orderItems, isRemoteArea);
  }

  async #getOrderItems(productIds: number[]): Promise<OrderLine[]> {
    const cartItems = await this.cartRepository.findAll();
    const hasSelectedProductIds = productIds.length > 0;
    const selectedCartItems = hasSelectedProductIds
      ? cartItems.filter(cartItem => productIds.includes(cartItem.productId))
      : cartItems;

    if (hasSelectedProductIds && selectedCartItems.length !== productIds.length) {
      throw new ServiceError(404, "선택한 상품이 장바구니에 없습니다.");
    }

    const orderedCartItems = hasSelectedProductIds
      ? this.#sortCartItemsByProductIds(selectedCartItems, productIds)
      : [...selectedCartItems].sort((a, b) => a.productId - b.productId);
    const productsToLoad = [
      ...new Set(
        orderedCartItems
          .filter(cartItem => cartItem.productData === undefined)
          .map(cartItem => cartItem.productId),
      ),
    ];
    const products = await this.productRepository.findByIds(productsToLoad);
    const productById = new Map(products.map(product => [product.id, product]));

    return orderedCartItems.map(cartItem =>
      this.#toOrderLine(cartItem, productById.get(cartItem.productId)),
    );
  }

  #sortCartItemsByProductIds(
    cartItems: CartRecord[],
    productIds: number[],
  ): CartRecord[] {
    const cartItemByProductId = new Map(
      cartItems.map(cartItem => [cartItem.productId, cartItem]),
    );

    return productIds.flatMap(productId => {
      const cartItem = cartItemByProductId.get(productId);
      return cartItem ? [cartItem] : [];
    });
  }

  #toOrderLine(
    cartItem: CartRecord,
    loadedProduct: ProductData | undefined,
  ): OrderLine {
    const productData = cartItem.productData ?? loadedProduct;

    if (!productData) {
      throw new ServiceError(404, "해당하는 상품이 없습니다.");
    }

    return {
      productId: cartItem.productId,
      productName: productData.name,
      productImg: productData.imgUrl,
      productPrice: productData.price,
      quantity: cartItem.quantity,
      lineAmount: productData.price * cartItem.quantity,
    };
  }

  #sortByRequestedOrder(
    coupons: CouponData[],
    couponCodes: CouponCode[],
  ): CouponData[] {
    const orderByCode = new Map(
      couponCodes.map((couponCode, index) => [couponCode, index]),
    );

    return [...coupons].sort(
      (a, b) => (orderByCode.get(a.code) ?? 0) - (orderByCode.get(b.code) ?? 0),
    );
  }

  #findSelectedCoupons(
    coupons: CouponData[],
    couponCodes: CouponCode[],
  ): CouponData[] {
    const couponByCode = new Map(coupons.map(coupon => [coupon.code, coupon]));
    return couponCodes.flatMap(couponCode => {
      const coupon = couponByCode.get(couponCode);
      return coupon ? [coupon] : [];
    });
  }
}
