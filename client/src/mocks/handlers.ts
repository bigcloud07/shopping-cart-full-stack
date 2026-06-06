import { http, HttpResponse } from "msw";
import type { CartItem } from "../type/type";

export const cartItems: CartItem[] = [
  { productId: 1, productName: "상품 A", productImg: "https://picsum.photos/200/200?random=1", productPrice: 10000, quantity: 2 },
  { productId: 2, productName: "상품 B", productImg: "https://picsum.photos/200/200?random=2", productPrice: 25000, quantity: 1 },
];

export const handlers = [
  http.get("/cart", () => {
    return HttpResponse.json({
      result: "success",
      data: { cartItems },
    });
  }),

  http.patch("/cart/:productId", async ({ params, request }) => {
    const productId = Number(params.productId);
    const { quantity } = await request.json() as { quantity: number };

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
];
