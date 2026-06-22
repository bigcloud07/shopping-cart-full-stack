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

const MAX_SELECTED_COUPON_COUNT = 2;

export interface OrderRequest {
  productIds?: unknown;
  isRemoteArea?: unknown;
}

export interface ApplyCouponRequest extends OrderRequest {
  couponCodes?: unknown;
}

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

  async createOrder(request: OrderRequest): Promise<OrderSummary> {
    const order = await this.#createOrderModel(request);
    return order.calculate();
  }

  async getCoupons(request: OrderRequest): Promise<CouponListResponse> {
    const order = await this.#createOrderModel(request);
    const coupons = await this.couponRepository.findAll();

    return {
      coupons: order.getCouponAvailability(coupons),
      bestCouponCodes: order.findBestCouponCodes(coupons),
    };
  }

  async applyCoupons(request: ApplyCouponRequest): Promise<OrderSummary> {
    const selectedCouponCodes = this.#parseCouponCodes(request.couponCodes);
    const order = await this.#createOrderModel(request);
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

  async #createOrderModel(request: OrderRequest): Promise<Order> {
    const productIds = this.#parseProductIds(request.productIds);
    const isRemoteArea = this.#parseBoolean(request.isRemoteArea);
    const orderItems = await this.#getOrderItems(productIds);

    if (orderItems.length === 0) {
      throw new ServiceError(400, "주문할 상품이 없습니다.");
    }

    return new Order(orderItems, isRemoteArea);
  }

  async #getOrderItems(productIds: number[] | null): Promise<OrderLine[]> {
    const cartItems = await this.cartRepository.findAll();
    const selectedCartItems = productIds
      ? cartItems.filter(cartItem => productIds.includes(cartItem.productId))
      : cartItems;

    if (productIds && selectedCartItems.length !== productIds.length) {
      throw new ServiceError(404, "선택한 상품이 장바구니에 없습니다.");
    }

    const productsToLoad = [
      ...new Set(
        selectedCartItems
          .filter(cartItem => cartItem.productData === undefined)
          .map(cartItem => cartItem.productId),
      ),
    ];
    const products = await this.productRepository.findByIds(productsToLoad);
    const productById = new Map(products.map(product => [product.id, product]));

    return selectedCartItems.map(cartItem =>
      this.#toOrderLine(cartItem, productById.get(cartItem.productId)),
    );
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

  #parseProductIds(productIds: unknown): number[] | null {
    if (productIds === undefined || productIds === null || productIds === "") {
      return null;
    }

    const values = Array.isArray(productIds) ? productIds : String(productIds).split(",");
    const parsedProductIds = values.map(value => Number(value));

    if (
      parsedProductIds.some(
        productId => !Number.isInteger(productId) || productId < 1,
      )
    ) {
      throw new ServiceError(400, "상품 id 형식이 유효하지 않습니다.");
    }

    return [...new Set(parsedProductIds)];
  }

  #parseCouponCodes(couponCodes: unknown): CouponCode[] {
    if (couponCodes === undefined || couponCodes === null || couponCodes === "") {
      return [];
    }

    const values = Array.isArray(couponCodes)
      ? couponCodes
      : String(couponCodes).split(",");
    const parsedCouponCodes = [
      ...new Set(values.map(value => String(value).trim())),
    ] as CouponCode[];

    if (parsedCouponCodes.length > MAX_SELECTED_COUPON_COUNT) {
      throw new ServiceError(400, "쿠폰은 최대 2개까지 선택할 수 있습니다.");
    }

    return parsedCouponCodes;
  }

  #parseBoolean(value: unknown): boolean {
    return value === true || value === "true";
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
