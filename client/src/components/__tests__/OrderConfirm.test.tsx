import { render, screen } from "@testing-library/react";
import { OrderConfirm } from "../OrderConfirm";

describe("OrderConfirm 컴포넌트", () => {
  test("종류 수와 수량 텍스트가 렌더링된다", () => {
    render(<OrderConfirm itemCount={2} totalQuantity={3} totalAmount={53000} />);

    expect(screen.getByText(/2종류의 상품 3개를 주문합니다/)).toBeInTheDocument();
  });

  test("총 결제 금액이 렌더링된다", () => {
    render(<OrderConfirm itemCount={2} totalQuantity={3} totalAmount={53000} />);

    expect(screen.getByText("53,000원")).toBeInTheDocument();
  });

  test("결제하기 버튼이 disabled 상태이다", () => {
    render(<OrderConfirm itemCount={2} totalQuantity={3} totalAmount={53000} />);

    expect(screen.getByRole("button", { name: "결제하기" })).toBeDisabled();
  });
});
