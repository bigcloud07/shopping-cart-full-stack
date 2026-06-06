import { render, screen } from "@testing-library/react";
import { OrderSummary } from "../OrderSummary";

describe("OrderSummary 컴포넌트", () => {
  test("주문 금액이 렌더링된다", () => {
    render(<OrderSummary totalOrderAmount={50000} />);

    expect(screen.getByText("50,000원")).toBeInTheDocument();
  });

  test("주문 금액이 100,000원 미만이면 배송비 3,000원이 표시된다", () => {
    render(<OrderSummary totalOrderAmount={50000} />);

    expect(screen.getByText("3,000원")).toBeInTheDocument();
  });

  test("주문 금액이 100,000원 미만이면 총 결제 금액이 주문 금액 + 3,000원이다", () => {
    render(<OrderSummary totalOrderAmount={50000} />);

    expect(screen.getByText("53,000원")).toBeInTheDocument();
  });

  test("주문 금액이 100,000원 이상이면 배송비 0원이 표시된다", () => {
    render(<OrderSummary totalOrderAmount={100000} />);

    expect(screen.getByText("0원")).toBeInTheDocument();
  });

  test("주문 금액이 100,000원 이상이면 총 결제 금액이 주문 금액과 같다", () => {
    render(<OrderSummary totalOrderAmount={100000} />);

    expect(screen.getAllByText("100,000원")).toHaveLength(2);
  });
});
