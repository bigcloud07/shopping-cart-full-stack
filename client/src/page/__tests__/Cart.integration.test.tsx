import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "../../mocks/server";
import { Cart } from "../Cart";
import type { CartItem } from "../../type/type";

const makeCartResponse = (items: CartItem[]) => ({
  result: "success",
  data: { cartItems: items },
});

beforeEach(() => {
  localStorage.clear();
});

describe("Cart 통합 테스트", () => {
  test("서버에서 상품 목록을 받아와 표시한다", async () => {
    server.use(
      http.get("/cart", () =>
        HttpResponse.json(
          makeCartResponse([
            { productId: 1, productName: "상품 A", productImg: "", productPrice: 10000, quantity: 2 },
            { productId: 2, productName: "상품 B", productImg: "", productPrice: 25000, quantity: 1 },
          ]),
        ),
      ),
    );

    render(<Cart />);

    await waitFor(() => {
      expect(screen.getByText("상품 A")).toBeInTheDocument();
      expect(screen.getByText("상품 B")).toBeInTheDocument();
    });
  });

  test("처음 방문하면 전체 상품이 선택된 상태로 표시된다", async () => {
    server.use(
      http.get("/cart", () =>
        HttpResponse.json(
          makeCartResponse([
            { productId: 1, productName: "상품 A", productImg: "", productPrice: 10000, quantity: 2 },
            { productId: 2, productName: "상품 B", productImg: "", productPrice: 25000, quantity: 1 },
          ]),
        ),
      ),
    );

    render(<Cart />);

    await waitFor(() => {
      expect(screen.getByText("상품 A")).toBeInTheDocument();
      expect(screen.getByText("상품 B")).toBeInTheDocument();
    });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      checkboxes.forEach((checkbox) => {
        expect(checkbox).toBeChecked();
      });
    });
  });

  test("+ 버튼 클릭 시 수량이 증가한다", async () => {
    let fetchCount = 0;
    server.use(
      http.get("/cart", () => {
        fetchCount++;
        const quantity = fetchCount === 1 ? 2 : 3;
        return HttpResponse.json(
          makeCartResponse([
            { productId: 1, productName: "상품 A", productImg: "", productPrice: 10000, quantity },
          ]),
        );
      }),
      http.patch("/cart/:productId", () => HttpResponse.json({ result: "success" })),
    );

    render(<Cart />);
    await waitFor(() => screen.getByText("상품 A"));

    await userEvent.click(screen.getByText("+"));

    await waitFor(() => expect(screen.getByText("3")).toBeInTheDocument());
  });

  test("+ 버튼 클릭 시 서버 응답 전에 수량을 먼저 갱신한다", async () => {
    let cartFetchCount = 0;
    let resolvePatch: () => void = () => {};
    const patchResponse = new Promise<void>((resolve) => {
      resolvePatch = resolve;
    });

    server.use(
      http.get("/cart", () => {
        cartFetchCount++;
        return HttpResponse.json(
          makeCartResponse([
            { productId: 1, productName: "상품 A", productImg: "", productPrice: 10000, quantity: 2 },
          ]),
        );
      }),
      http.patch("/cart/:productId", async () => {
        await patchResponse;
        return HttpResponse.json({ result: "success" });
      }),
    );

    render(<Cart />);
    await waitFor(() => screen.getByText("상품 A"));

    await userEvent.click(screen.getByText("+"));

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(cartFetchCount).toBe(1);

    resolvePatch();
  });

  test("삭제 버튼 클릭 시 해당 상품이 목록에서 제거된다", async () => {
    let fetchCount = 0;
    server.use(
      http.get("/cart", () => {
        fetchCount++;
        const items =
          fetchCount === 1
            ? [
                { productId: 1, productName: "상품 A", productImg: "", productPrice: 10000, quantity: 2 },
                { productId: 2, productName: "상품 B", productImg: "", productPrice: 25000, quantity: 1 },
              ]
            : [
                { productId: 2, productName: "상품 B", productImg: "", productPrice: 25000, quantity: 1 },
              ];
        return HttpResponse.json(makeCartResponse(items));
      }),
      http.delete("/cart/:productId", () => HttpResponse.json({ result: "success" })),
    );

    render(<Cart />);
    await waitFor(() => screen.getByText("상품 A"));

    await userEvent.click(screen.getAllByText("삭제")[0]);

    await waitFor(() => expect(screen.queryByText("상품 A")).not.toBeInTheDocument());
    expect(screen.getByText("상품 B")).toBeInTheDocument();
  });

  test("선택된 상품의 주문 금액이 OrderSummary에 반영된다", async () => {
    localStorage.setItem("selectedIds", JSON.stringify([1]));

    server.use(
      http.get("/cart", () =>
        HttpResponse.json(
          makeCartResponse([
            { productId: 1, productName: "상품 A", productImg: "", productPrice: 10000, quantity: 2 },
          ]),
        ),
      ),
    );

    render(<Cart />);
    await waitFor(() => screen.getByText("상품 A"));

    // 10,000 * 2 = 20,000 / 배송비 3,000 / 합계 23,000
    await waitFor(() => {
      expect(screen.getByText("20,000원")).toBeInTheDocument();
      expect(screen.getByText("3,000원")).toBeInTheDocument();
      expect(screen.getByText("23,000원")).toBeInTheDocument();
    });
  });
});
