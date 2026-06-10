import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Item } from "../Item";
import type { CartItem } from "../../type/type";

const mockItem: CartItem = {
  productId: 1,
  productName: "상품 A",
  productImg: "https://example.com/a.jpg",
  productPrice: 10000,
  quantity: 2,
};

const mockProps = {
  item: mockItem,
  isSelected: false,
  onPlus: vi.fn(),
  onMinus: vi.fn(),
  onSelectItem: vi.fn(),
  onDelete: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Item 컴포넌트", () => {
  test("상품명, 가격, 수량이 렌더링된다", () => {
    render(<Item {...mockProps} />);

    expect(screen.getByText("상품 A")).toBeInTheDocument();
    expect(screen.getByText("10,000원")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("+ 버튼 클릭 시 onPlus가 호출된다", async () => {
    render(<Item {...mockProps} />);

    await userEvent.click(screen.getByText("+"));

    expect(mockProps.onPlus).toHaveBeenCalledWith(1);
  });

  test("− 버튼 클릭 시 onMinus가 호출된다", async () => {
    render(<Item {...mockProps} />);

    await userEvent.click(screen.getByText("−"));

    expect(mockProps.onMinus).toHaveBeenCalledWith(1);
  });

  test("삭제 버튼 클릭 시 onDelete가 호출된다", async () => {
    render(<Item {...mockProps} />);

    await userEvent.click(screen.getByText("삭제"));

    expect(mockProps.onDelete).toHaveBeenCalledWith(1);
  });

  test("체크박스 클릭 시 onSelectItem이 호출된다", async () => {
    render(<Item {...mockProps} />);

    await userEvent.click(screen.getByRole("checkbox"));

    expect(mockProps.onSelectItem).toHaveBeenCalledWith(1);
  });

  test("isSelected가 true이면 체크박스가 체크된 상태이다", () => {
    render(<Item {...mockProps} isSelected={true} />);

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  test("isSelected가 false이면 체크박스가 체크 해제된 상태이다", () => {
    render(<Item {...mockProps} isSelected={false} />);

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
