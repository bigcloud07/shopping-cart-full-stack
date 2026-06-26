import request from "supertest";
import { createApp } from "../src/app.js";
import { ProductDB } from "../src/db/db.js";

const productA = {
  name: "상품이름A",
  imgUrl: "https://src.com/image-a.png",
  price: 60000,
};

const productB = {
  name: "상품이름B",
  imgUrl: "https://src.com/image-b.png",
  price: 30000,
};

function createOrderTestDb() {
  const testDb = {
    PRODUCT_TABLE: new ProductDB(),
    CART_TABLE: new Map(),
  };

  testDb.CART_TABLE.set(1, {
    productData: productA,
    quantity: 2,
  });
  testDb.CART_TABLE.set(2, {
    productData: productB,
    quantity: 1,
  });

  return testDb;
}

describe("Order API", () => {
  describe("POST /order", () => {
    it("Success[status:201] 선택한 장바구니 상품으로 주문 금액을 계산한다.", async () => {
      const app = createApp(createOrderTestDb());

      const response = await request(app)
        .post("/order")
        .type("json")
        .send({ productIds: [1, 2], isRemoteArea: true })
        .expect(201);

      expect(response.body.data.price).toEqual({
        orderAmount: 150000,
        productDiscountAmount: 0,
        shippingFee: 0,
        shippingDiscountAmount: 0,
        totalDiscountAmount: 0,
        finalPaymentAmount: 150000,
      });
      expect(response.body.data.orderItems).toHaveLength(2);
    });

    it("Success[status:201] 요청한 상품 id 순서대로 주문 상품을 반환한다.", async () => {
      const app = createApp(createOrderTestDb());

      const response = await request(app)
        .post("/order")
        .type("json")
        .send({ productIds: [2, 1] })
        .expect(201);

      expect(
        response.body.data.orderItems.map(
          (orderItem: { productId: number }) => orderItem.productId,
        ),
      ).toEqual([2, 1]);
    });

    it("Success[status:201] 주문 금액이 100,000원 이상이면 도서산간 지역도 무료 배송이다.", async () => {
      const app = createApp(createOrderTestDb());

      const response = await request(app)
        .post("/order")
        .type("json")
        .send({ productIds: [1], isRemoteArea: true })
        .expect(201);

      expect(response.body.data.price).toEqual(
        expect.objectContaining({
          orderAmount: 120000,
          shippingFee: 0,
          finalPaymentAmount: 120000,
        }),
      );
    });

    it("Error[status:400] 도서산간 지역 여부 형식이 유효하지 않으면 주문을 생성하지 않는다.", async () => {
      const app = createApp(createOrderTestDb());

      const response = await request(app)
        .post("/order")
        .type("json")
        .send({ productIds: [1], isRemoteArea: "invalid" })
        .expect(400);

      expect(response.body).toEqual({
        result: "error",
        message: "요청 값이 올바르지 않습니다.",
      });
    });
  });

  describe("GET /coupon", () => {
    it("Success[status:200] 주문에 사용할 수 있는 쿠폰 목록과 추천 조합을 반환한다.", async () => {
      const app = createApp(createOrderTestDb());

      const response = await request(app)
        .get("/coupon")
        .query({ productIds: "1,2", isRemoteArea: "true" })
        .expect(200);

      const fixedCoupon = response.body.data.coupons.find(
        ({ coupon }: { coupon: { code: string } }) => coupon.code === "FIXED5000",
      );
      const freeShippingCoupon = response.body.data.coupons.find(
        ({ coupon }: { coupon: { code: string } }) =>
          coupon.code === "FREESHIPPING",
      );

      expect(fixedCoupon).toEqual(
        expect.objectContaining({
          isAvailable: true,
          expectedDiscountAmount: 5000,
        }),
      );
      expect(freeShippingCoupon).toEqual(
        expect.objectContaining({
          isAvailable: true,
          expectedDiscountAmount: 0,
        }),
      );
      expect(response.body.data.bestCouponCodes.length).toBeLessThanOrEqual(2);
    });
  });

  describe("PATCH /order/coupon", () => {
    it("Success[status:200] 선택한 쿠폰을 적용한 주문 금액을 다시 계산한다.", async () => {
      const app = createApp(createOrderTestDb());

      const response = await request(app)
        .patch("/order/coupon")
        .type("json")
        .send({
          productIds: [1, 2],
          couponCodes: ["FIXED5000", "FREESHIPPING"],
          isRemoteArea: true,
        })
        .expect(200);

      expect(response.body.data.selectedCouponCodes).toEqual([
        "FIXED5000",
        "FREESHIPPING",
      ]);
      expect(response.body.data.price).toEqual({
        orderAmount: 150000,
        productDiscountAmount: 5000,
        shippingFee: 0,
        shippingDiscountAmount: 0,
        totalDiscountAmount: 5000,
        finalPaymentAmount: 145000,
      });
    });

    it("Error[status:400] 쿠폰은 최대 2개까지만 적용할 수 있다.", async () => {
      const app = createApp(createOrderTestDb());

      const response = await request(app)
        .patch("/order/coupon")
        .type("json")
        .send({
          productIds: [1, 2],
          couponCodes: ["FIXED5000", "FREESHIPPING", "BOGO"],
        })
        .expect(400);

      expect(response.body).toEqual({
        result: "error",
        message: "쿠폰은 최대 2개까지 선택할 수 있습니다.",
      });
    });
  });
});
