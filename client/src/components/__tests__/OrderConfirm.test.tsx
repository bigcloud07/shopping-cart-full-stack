import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { OrderConfirm } from "../OrderConfirm";
import type { CartItem } from "../../type/type";
import { server } from "../../mocks/server";

const items: CartItem[] = [
  {
    productId: 1,
    productName: "상품 A",
    productImg: "",
    productPrice: 35000,
    quantity: 2,
  },
];

const renderOrderConfirm = () =>
  render(
    <OrderConfirm
      items={items}
      itemCount={1}
      totalQuantity={2}
      onReturnToCart={() => {}}
    />,
  );

const expectPriceRow = (label: string, value: string) => {
  expect(screen.getByText(label).parentElement).toHaveTextContent(
    `${label}${value}`,
  );
};

describe("OrderConfirm 컴포넌트", () => {
  test("종류 수와 수량 텍스트가 렌더링된다", () => {
    renderOrderConfirm();

    expect(screen.getByText(/1종류의 상품 2개를 주문합니다/)).toBeInTheDocument();
  });

  test("서버가 응답한 총 결제 금액이 렌더링된다", async () => {
    server.use(
      http.post("/order", () =>
        HttpResponse.json({
          result: "success",
          data: {
            orderItems: items.map((item) => ({
              ...item,
              lineAmount: item.productPrice * item.quantity,
            })),
            selectedCouponCodes: [],
            appliedCoupons: [],
            bestCouponCodes: [],
            price: {
              orderAmount: 70000,
              productDiscountAmount: 0,
              shippingFee: 3000,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 0,
              finalPaymentAmount: 73000,
            },
            isRemoteArea: false,
          },
        }),
      ),
    );

    renderOrderConfirm();

    expect(await screen.findByText("73,000원")).toBeInTheDocument();
  });

  test("서버 배송비가 클라이언트 배송 정책과 달라도 서버 응답을 그대로 표시한다", async () => {
    const highAmountItems: CartItem[] = [
      {
        productId: 1,
        productName: "상품 A",
        productImg: "",
        productPrice: 120000,
        quantity: 1,
      },
    ];

    server.use(
      http.post("/order", () =>
        HttpResponse.json({
          result: "success",
          data: {
            orderItems: highAmountItems.map((item) => ({
              ...item,
              lineAmount: item.productPrice * item.quantity,
            })),
            selectedCouponCodes: [],
            appliedCoupons: [],
            bestCouponCodes: [],
            price: {
              orderAmount: 120000,
              productDiscountAmount: 0,
              shippingFee: 3000,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 0,
              finalPaymentAmount: 123000,
            },
            isRemoteArea: false,
          },
        }),
      ),
    );

    render(
      <OrderConfirm
        items={highAmountItems}
        itemCount={1}
        totalQuantity={1}
        onReturnToCart={() => {}}
      />,
    );

    await waitFor(() => {
      expectPriceRow("배송비", "3,000원");
      expectPriceRow("총 결제 금액", "123,000원");
    });
  });

  test("결제하기 버튼 클릭 시 결제 확인 화면을 표시한다", async () => {
    renderOrderConfirm();

    await userEvent.click(screen.getByRole("button", { name: "결제하기" }));

    expect(screen.getByRole("heading", { name: "결제 확인" })).toBeInTheDocument();
  });

  test("도서 산간 지역 체크 시 서버 응답의 결제 금액을 표시한다", async () => {
    let resolveOrder: () => void = () => {};
    const pendingOrder = new Promise<void>((resolve) => {
      resolveOrder = resolve;
    });

    server.use(
      http.post("/order", async () => {
        await pendingOrder;

        return HttpResponse.json({
          result: "success",
          data: {
            orderItems: items.map((item) => ({
              ...item,
              lineAmount: item.productPrice * item.quantity,
            })),
            selectedCouponCodes: [],
            appliedCoupons: [],
            bestCouponCodes: [],
            price: {
              orderAmount: 70000,
              productDiscountAmount: 0,
              shippingFee: 6000,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 0,
              finalPaymentAmount: 76000,
            },
            isRemoteArea: true,
          },
        });
      }),
    );

    renderOrderConfirm();

    await userEvent.click(screen.getByLabelText("제주도 및 도서 산간 지역"));

    expectPriceRow("총 결제 금액", "70,000원");
    expect(screen.getByRole("button", { name: "결제하기" })).toBeEnabled();

    resolveOrder();

    expect(await screen.findByText("76,000원")).toBeInTheDocument();
  });

  test("주문 금액이 100,000원 이상이면 도서 산간 지역을 체크해도 무료 배송을 유지한다", async () => {
    let resolveOrder: () => void = () => {};
    const pendingOrder = new Promise<void>((resolve) => {
      resolveOrder = resolve;
    });
    const freeShippingItems: CartItem[] = [
      {
        productId: 1,
        productName: "상품 A",
        productImg: "",
        productPrice: 100000,
        quantity: 1,
      },
    ];

    server.use(
      http.post("/order", async () => {
        await pendingOrder;

        return HttpResponse.json({
          result: "success",
          data: {
            orderItems: freeShippingItems.map((item) => ({
              ...item,
              lineAmount: item.productPrice * item.quantity,
            })),
            selectedCouponCodes: [],
            appliedCoupons: [],
            bestCouponCodes: [],
            price: {
              orderAmount: 100000,
              productDiscountAmount: 0,
              shippingFee: 0,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 0,
              finalPaymentAmount: 100000,
            },
            isRemoteArea: true,
          },
        });
      }),
    );

    render(
      <OrderConfirm
        items={freeShippingItems}
        itemCount={1}
        totalQuantity={1}
        onReturnToCart={() => {}}
      />,
    );

    await userEvent.click(screen.getByLabelText("제주도 및 도서 산간 지역"));

    expectPriceRow("배송비", "0원");
    expectPriceRow("총 결제 금액", "100,000원");

    resolveOrder();
  });

  test("쿠폰 적용 후 도서 산간 지역을 체크해도 100,000원 이상 주문은 무료 배송을 유지한다", async () => {
    const highAmountItems: CartItem[] = [
      {
        productId: 1,
        productName: "상품 A",
        productImg: "",
        productPrice: 120000,
        quantity: 1,
      },
    ];

    server.use(
      http.get("/coupon", () =>
        HttpResponse.json({
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
                  minimumAmount: 100000,
                },
                isAvailable: true,
                unavailableReason: null,
                expectedDiscountAmount: 5000,
              },
            ],
            bestCouponCodes: ["FIXED5000"],
          },
        }),
      ),
      http.patch("/order/coupon", () =>
        HttpResponse.json({
          result: "success",
          data: {
            orderItems: highAmountItems.map((item) => ({
              ...item,
              lineAmount: item.productPrice * item.quantity,
            })),
            selectedCouponCodes: ["FIXED5000"],
            appliedCoupons: [
              {
                code: "FIXED5000",
                description: "5,000원 할인 쿠폰",
                discountAmount: 5000,
                target: "product",
              },
            ],
            bestCouponCodes: ["FIXED5000"],
            price: {
              orderAmount: 120000,
              productDiscountAmount: 5000,
              shippingFee: 0,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 5000,
              finalPaymentAmount: 115000,
            },
            isRemoteArea: false,
          },
        }),
      ),
      http.post("/order", async ({ request }) => {
        const body = (await request.json()) as { isRemoteArea?: boolean };
        const wrongShippingFee = body.isRemoteArea ? 3000 : 0;

        return HttpResponse.json({
          result: "success",
          data: {
            orderItems: highAmountItems.map((item) => ({
              ...item,
              lineAmount: item.productPrice * item.quantity,
            })),
            selectedCouponCodes: [],
            appliedCoupons: [],
            bestCouponCodes: [],
            price: {
              orderAmount: 120000,
              productDiscountAmount: 0,
              shippingFee: wrongShippingFee,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 0,
              finalPaymentAmount: 120000 + wrongShippingFee,
            },
            isRemoteArea: Boolean(body.isRemoteArea),
          },
        });
      }),
    );

    render(
      <OrderConfirm
        items={highAmountItems}
        itemCount={1}
        totalQuantity={1}
        onReturnToCart={() => {}}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "쿠폰 적용" })).toBeEnabled();
    });
    await userEvent.click(screen.getByRole("button", { name: "쿠폰 적용" }));
    await userEvent.click(
      screen.getByRole("button", { name: /할인 쿠폰 사용하기/ }),
    );

    await waitFor(() => {
      expectPriceRow("총 결제 금액", "115,000원");
    });

    await userEvent.click(screen.getByLabelText("제주도 및 도서 산간 지역"));

    await waitFor(() => {
      expectPriceRow("배송비", "0원");
      expectPriceRow("쿠폰 할인 금액", "-5,000원");
      expectPriceRow("총 결제 금액", "115,000원");
    });
  });

  test("쿠폰 목록을 미리 불러와 모달을 열 때 바로 표시한다", async () => {
    let couponRequestCount = 0;

    server.use(
      http.get("/coupon", () => {
        couponRequestCount++;

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
              {
                coupon: {
                  id: 4,
                  code: "MIRACLESALE",
                  description: "미라클모닝 30% 할인 쿠폰",
                  expirationDate: "2026-07-31",
                  discountType: "percentage",
                  discountRate: 30,
                  availableTime: { start: "04:00", end: "07:00" },
                },
                isAvailable: true,
                unavailableReason: null,
                expectedDiscountAmount: 21000,
              },
            ],
            bestCouponCodes: ["FIXED5000"],
          },
        });
      }),
    );

    renderOrderConfirm();

    await waitFor(() => {
      expect(couponRequestCount).toBe(1);
    });

    await userEvent.click(screen.getByRole("button", { name: "쿠폰 적용" }));

    expect(screen.queryByText("쿠폰을 불러오는 중입니다.")).not.toBeInTheDocument();
    expect(screen.getByText("5,000원 할인 쿠폰")).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "쿠폰 선택" })).toHaveTextContent(
      "최소 주문 금액: 10,000원",
    );
    expect(screen.getByRole("dialog", { name: "쿠폰 선택" })).toHaveTextContent(
      "최소 주문 금액: 50,000원",
    );
    expect(screen.getByRole("dialog", { name: "쿠폰 선택" })).toHaveTextContent(
      "사용 가능 시간: 오전 4시부터 7시까지",
    );
  });

  test("쿠폰 목록은 서버 응답의 설명과 할인 정보를 그대로 표시한다", async () => {
    server.use(
      http.get("/coupon", () =>
        HttpResponse.json({
          result: "success",
          data: {
            coupons: [
              {
                coupon: {
                  id: 1,
                  code: "FIXED5000",
                  description: "서버가 내려준 특별 할인 쿠폰",
                  expirationDate: "2026-12-31",
                  discountType: "fixed",
                  discountAmount: 7777,
                  minimumAmount: 12345,
                },
                isAvailable: true,
                unavailableReason: null,
                expectedDiscountAmount: 7777,
              },
            ],
            bestCouponCodes: ["FIXED5000"],
          },
        }),
      ),
    );

    renderOrderConfirm();

    await userEvent.click(screen.getByRole("button", { name: "쿠폰 적용" }));

    const couponDialog = await screen.findByRole("dialog", {
      name: "쿠폰 선택",
    });
    expect(couponDialog).toHaveTextContent("서버가 내려준 특별 할인 쿠폰");
    expect(couponDialog).toHaveTextContent("최소 주문 금액: 12,345원");
    expect(couponDialog).toHaveTextContent("예상 할인: 7,777원");
    expect(couponDialog).not.toHaveTextContent("5,000원 할인 쿠폰");
  });

  test("첫 모달 오픈 시 쿠폰 API 응답 전에는 로딩 상태를 표시한다", async () => {
    let resolveCouponRequest: () => void = () => {};
    const pendingCouponRequest = new Promise<void>((resolve) => {
      resolveCouponRequest = resolve;
    });

    server.use(
      http.get("/coupon", async () => {
        await pendingCouponRequest;

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
            ],
            bestCouponCodes: ["FIXED5000"],
          },
        });
      }),
    );

    renderOrderConfirm();

    await userEvent.click(screen.getByRole("button", { name: "쿠폰 적용" }));

    expect(screen.getByText("쿠폰을 불러오는 중입니다.")).toBeInTheDocument();
    expect(screen.queryByText("5,000원 할인 쿠폰")).not.toBeInTheDocument();

    resolveCouponRequest();

    expect(await screen.findByText("5,000원 할인 쿠폰")).toBeInTheDocument();
    expect(screen.queryByText("쿠폰을 불러오는 중입니다.")).not.toBeInTheDocument();
  });

  test("모달이 열린 뒤 도착한 주문 응답이 추천 쿠폰 체크 상태를 초기화하지 않는다", async () => {
    let resolveOrderRequest: () => void = () => {};
    const pendingOrderRequest = new Promise<void>((resolve) => {
      resolveOrderRequest = resolve;
    });
    let resolveCouponRequest: () => void = () => {};
    const pendingCouponRequest = new Promise<void>((resolve) => {
      resolveCouponRequest = resolve;
    });

    server.use(
      http.post("/order", async () => {
        await pendingOrderRequest;

        return HttpResponse.json({
          result: "success",
          data: {
            orderItems: items.map((item) => ({
              ...item,
              lineAmount: item.productPrice * item.quantity,
            })),
            selectedCouponCodes: [],
            appliedCoupons: [],
            bestCouponCodes: [],
            price: {
              orderAmount: 70000,
              productDiscountAmount: 0,
              shippingFee: 3000,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 0,
              finalPaymentAmount: 73000,
            },
            isRemoteArea: false,
          },
        });
      }),
      http.get("/coupon", async () => {
        await pendingCouponRequest;

        return HttpResponse.json({
          result: "success",
          data: {
            coupons: [
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
            bestCouponCodes: ["FREESHIPPING"],
          },
        });
      }),
    );

    renderOrderConfirm();

    await userEvent.click(screen.getByRole("button", { name: "쿠폰 적용" }));

    expect(screen.getByText("쿠폰을 불러오는 중입니다.")).toBeInTheDocument();

    resolveOrderRequest();

    await waitFor(() => {
      expect(screen.getByText("73,000원")).toBeInTheDocument();
    });
    expect(screen.queryByText("무료 배송 쿠폰")).not.toBeInTheDocument();

    resolveCouponRequest();

    await waitFor(() => {
      expect(screen.getByLabelText("무료 배송 쿠폰")).toBeChecked();
    });
  });

  test("배송 정보 변경 후 쿠폰 재조회 중에도 기존 쿠폰 목록을 먼저 표시한다", async () => {
    let couponRequestCount = 0;
    let resolveSecondCouponRequest: () => void = () => {};
    const pendingSecondCouponRequest = new Promise<void>((resolve) => {
      resolveSecondCouponRequest = resolve;
    });

    server.use(
      http.get("/coupon", async () => {
        couponRequestCount++;

        if (couponRequestCount > 1) {
          await pendingSecondCouponRequest;
        }

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
            ],
            bestCouponCodes: ["FIXED5000"],
          },
        });
      }),
    );

    renderOrderConfirm();

    await waitFor(() => {
      expect(couponRequestCount).toBe(1);
    });

    await userEvent.click(screen.getByLabelText("제주도 및 도서 산간 지역"));
    await userEvent.click(screen.getByRole("button", { name: "쿠폰 적용" }));

    expect(screen.queryByText("쿠폰을 불러오는 중입니다.")).not.toBeInTheDocument();
    expect(screen.getByText("5,000원 할인 쿠폰")).toBeInTheDocument();

    resolveSecondCouponRequest();
  });

  test("서버 주문 응답 순서가 달라도 선택한 상품 순서대로 표시한다", async () => {
    const orderedItems: CartItem[] = [
      {
        productId: 1,
        productName: "상품 A",
        productImg: "",
        productPrice: 10000,
        quantity: 1,
      },
      {
        productId: 2,
        productName: "상품 B",
        productImg: "",
        productPrice: 20000,
        quantity: 1,
      },
    ];

    server.use(
      http.post("/order", () =>
        HttpResponse.json({
          result: "success",
          data: {
            orderItems: [
              {
                ...orderedItems[1],
                productName: "서버 상품 B",
                lineAmount: orderedItems[1].productPrice * orderedItems[1].quantity,
              },
              {
                ...orderedItems[0],
                productName: "서버 상품 A",
                lineAmount: orderedItems[0].productPrice * orderedItems[0].quantity,
              },
            ],
            selectedCouponCodes: [],
            appliedCoupons: [],
            bestCouponCodes: [],
            price: {
              orderAmount: 30000,
              productDiscountAmount: 0,
              shippingFee: 3000,
              shippingDiscountAmount: 0,
              totalDiscountAmount: 0,
              finalPaymentAmount: 33000,
            },
            isRemoteArea: false,
          },
        }),
      ),
    );

    render(
      <OrderConfirm
        items={orderedItems}
        itemCount={2}
        totalQuantity={2}
        onReturnToCart={() => {}}
      />,
    );

    await waitFor(() => {
      const productNames = screen.getAllByText(/서버 상품 [AB]/);
      expect(productNames.map((element) => element.textContent)).toEqual([
        "서버 상품 A",
        "서버 상품 B",
      ]);
    });
  });
});
