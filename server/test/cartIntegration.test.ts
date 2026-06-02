import request from "supertest";
import { createApp } from "../src/app.js";

const cartItem_1 = {
  productData: { name: "상품이름A", imgUrl: "/src.com", price: 35000 },
  quantity: 2,
};
const cartItem_2 = {
  productData: { name: "상품이름B", imgUrl: "/src.com", price: 25000 },
  quantity: 2,
};

describe("GET /cart", () => {
  it("Success[status:200] 장바구니안의 상품 정보들을 모두 가져온다.", async () => {
    const testDb = {
      PRODUCT_TABLE: new Map(),
      CART_TABLE: new Map(),
    };

    testDb.CART_TABLE.set(1, cartItem_1);
    testDb.CART_TABLE.set(2, cartItem_2);

    const app = createApp(testDb);
    const response = await request(app).get("/cart").type("json").expect(200);
    expect(response.body).toEqual({
      result: "success",
      data: {
        cartItems: [
          {
            productId: 1,
            productName: "상품이름A",
            productImg: "/src.com",
            productPrice: 35000,
            quantity: 2,
          },
          {
            productId: 2,
            productName: "상품이름B",
            productImg: "/src.com",
            productPrice: 25000,
            quantity: 2,
          },
        ],
      },
    });
  });
});

describe("PATCH /cart/:productId", () => {
  it("Success[status:200] 장바구니에서 해당 상품의 수량을 변경한다.", async () => {
    const testDb = {
      PRODUCT_TABLE: new Map(),
      CART_TABLE: new Map(),
    };

    testDb.CART_TABLE.set(1, cartItem_1);
    testDb.CART_TABLE.set(2, cartItem_2);

    const app = createApp(testDb);
    const response = await request(app)
      .patch("/cart/1")
      .type("json")
      .send({
        quantity: 3,
      })
      .expect(200);
    expect(response.body).toEqual({
      result: "success",
      data: {
        productId: 1,
        quantity: 3,
      },
    });
  });

  it("Success[status:200] 수량 변경 후 GET /cart에서 상품 정보가 유지된다.", async () => {
    const testDb = {
      PRODUCT_TABLE: new Map(),
      CART_TABLE: new Map(),
    };

    testDb.CART_TABLE.set(1, cartItem_1);
    testDb.CART_TABLE.set(2, cartItem_2);

    const app = createApp(testDb);
    await request(app)
      .patch("/cart/1")
      .type("json")
      .send({ quantity: 5 })
      .expect(200);

    const response = await request(app).get("/cart").expect(200);
    expect(response.body).toEqual({
      result: "success",
      data: {
        cartItems: [
          {
            productId: 1,
            productName: "상품이름A",
            productImg: "/src.com",
            productPrice: 35000,
            quantity: 5,
          },
          {
            productId: 2,
            productName: "상품이름B",
            productImg: "/src.com",
            productPrice: 25000,
            quantity: 2,
          },
        ],
      },
    });
  });

  it("Error[Status:400] 변경 수량이 유효하지 않을 때", async () => {
    const testDb = {
      PRODUCT_TABLE: new Map(),
      CART_TABLE: new Map(),
    };

    testDb.CART_TABLE.set(1, cartItem_1);
    testDb.CART_TABLE.set(2, cartItem_2);

    const app = createApp(testDb);
    const response = await request(app)
      .patch("/cart/1")
      .type("json")
      .send({ quantity: -1 })
      .expect(400);

    expect(response.body).toEqual({
      result: "error",
      message: "수량이 유효하지 않습니다.",
    });
  });

  it("Error[Status:404] 장바구니에 해당 상품이 없을 때", async () => {
    const testDb = {
      PRODUCT_TABLE: new Map(),
      CART_TABLE: new Map(),
    };

    testDb.CART_TABLE.set(1, cartItem_1);
    testDb.CART_TABLE.set(2, cartItem_2);

    const app = createApp(testDb);
    const response = await request(app)
      .patch("/cart/999")
      .type("json")
      .send({ quantity: 3 })
      .expect(404);

    expect(response.body).toEqual({
      result: "error",
      message: "해당하는 장바구니 항목이 없습니다.",
    });
  });
});

describe("DELETE /cart/1", () => {
  it("Success[Status:204] 장바구니의 특정 상품을 삭제한다", async () => {
    const testDb = {
      PRODUCT_TABLE: new Map(),
      CART_TABLE: new Map(),
    };

    testDb.CART_TABLE.set(1, cartItem_1);

    const app = createApp(testDb);

    const response = await request(app).delete("/cart/1").expect(204);

    expect(response.body).toEqual({});
  });
});
