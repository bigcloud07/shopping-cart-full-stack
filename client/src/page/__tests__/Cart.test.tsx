import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Cart } from "../Cart";
import type { CartItem } from "../../type/type";

const mockCartResponse = (items: CartItem[] = []) => ({
  result: "success",
  data: { cartItems: items },
});

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("Cart 컴포넌트 - 수량 경계값", () => {
  test("수량 99개인 상품의 + 버튼 클릭 시 alert가 뜨고 fetch 요청이 발생하지 않는다", async () => {
    const cartItem = {
      productId: 1,
      productName: "상품 A",
      productImg: "",
      productPrice: 10000,
      quantity: 99,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCartResponse([cartItem])),
      }),
    );
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Cart />);
    await waitFor(() => screen.getByText("상품 A"));

    const fetchCallCount = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    await userEvent.click(screen.getByText("+"));

    expect(alertMock).toHaveBeenCalledWith("수량은 최대 99개까지 가능합니다.");
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(fetchCallCount);
  });

  test("수량 1개인 상품의 − 버튼 클릭 시 alert가 뜨고 fetch 요청이 발생하지 않는다", async () => {
    const cartItem = {
      productId: 1,
      productName: "상품 A",
      productImg: "",
      productPrice: 10000,
      quantity: 1,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCartResponse([cartItem])),
      }),
    );
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Cart />);
    await waitFor(() => screen.getByText("상품 A"));

    const fetchCallCount = (fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    await userEvent.click(screen.getByText("−"));

    expect(alertMock).toHaveBeenCalledWith("수량은 1개 이상부터 가능합니다.");
    expect((fetch as ReturnType<typeof vi.fn>).mock.calls.length).toBe(fetchCallCount);
  });

  test("수량 변경 요청이 실패하면 경계값 알림이 아닌 실패 alert가 뜬다", async () => {
    const cartItem = {
      productId: 1,
      productName: "상품 A",
      productImg: "",
      productPrice: 10000,
      quantity: 2,
    };

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockCartResponse([cartItem])),
        })
        .mockResolvedValueOnce({ ok: false, status: 400 }),
    );
    const alertMock = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<Cart />);
    await waitFor(() => screen.getByText("상품 A"));

    await userEvent.click(screen.getByText("−"));

    expect(alertMock).toHaveBeenCalledWith("수량 변경에 실패했습니다.");
    expect(alertMock).not.toHaveBeenCalledWith(
      "수량은 1개 이상부터 가능합니다.",
    );
  });
});
