import { http, HttpResponse } from "msw";
import type { CartItem, CouponCode } from "../type/type";

const INITIAL_CART_ITEMS: CartItem[] = [
  {
    productId: 1,
    productName: "상품 A",
    productImg: "https://picsum.photos/200/200?random=1",
    productPrice: 10000,
    quantity: 2,
  },
  {
    productId: 2,
    productName: "상품 B",
    productImg: "https://picsum.photos/200/200?random=2",
    productPrice: 25000,
    quantity: 1,
  },
];

export let cartItems: CartItem[] = structuredClone(INITIAL_CART_ITEMS);

export const resetCartItems = () => {
  cartItems = structuredClone(INITIAL_CART_ITEMS);
};

const getSelectedItems = (productIds?: number[]) => {
  if (!productIds || productIds.length === 0) {
    return cartItems;
  }

  return cartItems.filter((item) => productIds.includes(item.productId));
};

const makeOrderSummary = (
  selectedItems: CartItem[],
  isRemoteArea: boolean,
  couponCodes: CouponCode[] = [],
) => {
  const orderAmount = selectedItems.reduce(
    (total, item) => total + item.productPrice * item.quantity,
    0,
  );
  const baseShippingFee = orderAmount >= 100000 ? 0 : 3000;
  const shippingFee =
    baseShippingFee === 0 ? 0 : baseShippingFee + (isRemoteArea ? 3000 : 0);
  const productDiscountAmount = couponCodes.includes("FIXED5000") ? 5000 : 0;
  const shippingDiscountAmount = couponCodes.includes("FREESHIPPING")
    ? shippingFee
    : 0;
  const totalDiscountAmount = productDiscountAmount + shippingDiscountAmount;

  return {
    orderItems: selectedItems.map((item) => ({
      ...item,
      lineAmount: item.productPrice * item.quantity,
    })),
    selectedCouponCodes: couponCodes,
    appliedCoupons: couponCodes.map((code) => ({
      code,
      description:
        code === "FREESHIPPING" ? "무료 배송 쿠폰" : "5,000원 할인 쿠폰",
      discountAmount:
        code === "FREESHIPPING"
          ? shippingDiscountAmount
          : productDiscountAmount,
      target: code === "FREESHIPPING" ? "shipping" : "product",
    })),
    bestCouponCodes: ["FIXED5000"],
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
    isRemoteArea,
  };
};

export const handlers = [
  http.get("/cart", () => {
    return HttpResponse.json({
      result: "success",
      data: { cartItems },
    });
  }),

  http.patch("/cart/:productId", async ({ params, request }) => {
    const productId = Number(params.productId);
    const { quantity } = (await request.json()) as { quantity: number };

    if (quantity < 1) {
      return new HttpResponse(null, { status: 400 });
    }

    const item = cartItems.find((i) => i.productId === productId);
    if (item) item.quantity = quantity;

    return HttpResponse.json({ result: "success" });
  }),

  http.delete("/cart/:productId", ({ params }) => {
    const productId = Number(params.productId);
    const index = cartItems.findIndex((i) => i.productId === productId);
    if (index !== -1) cartItems.splice(index, 1);

    return HttpResponse.json({ result: "success" });
  }),

  http.post("/order", async ({ request }) => {
    const body = (await request.json()) as {
      productIds?: number[];
      isRemoteArea?: boolean;
    };

    return HttpResponse.json(
      {
        result: "success",
        data: makeOrderSummary(
          getSelectedItems(body.productIds),
          Boolean(body.isRemoteArea),
        ),
      },
      { status: 201 },
    );
  }),

  http.get("/coupon", () => {
    return HttpResponse.json({
      result: "success",
      data: {
        coupons: [
          {
            coupon: {
              id: 1,
              code: "FIXED5000",
              description: "5,000원 할인 쿠폰",
              expirationDate: "2026-11-30",
              discountType: "fixed",
              discountAmount: 5000,
              minimumAmount: 10000,
            },
            isAvailable: true,
            unavailableReason: null,
            expectedDiscountAmount: 5000,
          },
          {
            coupon: {
              id: 3,
              code: "FREESHIPPING",
              description: "무료 배송 쿠폰",
              expirationDate: "2026-08-31",
              discountType: "freeShipping",
              minimumAmount: 50000,
            },
            isAvailable: true,
            unavailableReason: null,
            expectedDiscountAmount: 3000,
          },
        ],
        bestCouponCodes: ["FIXED5000"],
      },
    });
  }),

  http.patch("/order/coupon", async ({ request }) => {
    const body = (await request.json()) as {
      productIds?: number[];
      isRemoteArea?: boolean;
      couponCodes?: CouponCode[];
    };

    return HttpResponse.json({
      result: "success",
      data: makeOrderSummary(
        getSelectedItems(body.productIds),
        Boolean(body.isRemoteArea),
        body.couponCodes ?? [],
      ),
    });
  }),
];
