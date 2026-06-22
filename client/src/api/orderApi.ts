import { API_URL } from "../config";
import type {
  CartItem,
  CouponCode,
  CouponListResponse,
  OrderSummaryResponse,
} from "../type/type";

const makeOrderPayload = (items: CartItem[], isRemoteArea: boolean) => ({
  productIds: items.map((item) => item.productId),
  isRemoteArea,
});

export const requestOrderSummary = async (
  items: CartItem[],
  isRemoteArea: boolean,
) => {
  const response = await fetch(`${API_URL}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(makeOrderPayload(items, isRemoteArea)),
  });

  if (!response.ok) {
    throw new Error("주문 정보를 불러오지 못했습니다.");
  }

  const orderResponse: OrderSummaryResponse = await response.json();
  return orderResponse.data;
};

export const requestCoupons = async (
  items: CartItem[],
  isRemoteArea: boolean,
) => {
  const params = new URLSearchParams();
  items.forEach((item) => params.append("productIds", String(item.productId)));
  params.set("isRemoteArea", String(isRemoteArea));

  const response = await fetch(`${API_URL}/coupon?${params.toString()}`);

  if (!response.ok) {
    throw new Error("쿠폰 정보를 불러오지 못했습니다.");
  }

  const couponResponse: CouponListResponse = await response.json();
  return couponResponse.data;
};

export const requestApplyCoupons = async (
  items: CartItem[],
  isRemoteArea: boolean,
  couponCodes: CouponCode[],
) => {
  const response = await fetch(`${API_URL}/order/coupon`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...makeOrderPayload(items, isRemoteArea),
      couponCodes,
    }),
  });

  if (!response.ok) {
    throw new Error("쿠폰 적용에 실패했습니다.");
  }

  const orderResponse: OrderSummaryResponse = await response.json();
  return orderResponse.data;
};
