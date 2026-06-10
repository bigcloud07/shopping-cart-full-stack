import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Item } from "../Item";
import type { CartItem } from "../../type/type";
import { CartItemActionsContext } from "../../context/CartItemActionsContext";

const mockItem: CartItem = {
  productId: 1,
  productName: "상품 A",
  productImg: "https://example.com/a.jpg",
  productPrice: 10000,
  quantity: 2,
};

const mockActions = {
  onPlus: vi.fn(),
  onMinus: vi.fn(),
  onSelectItem: vi.fn(),
  onDelete: vi.fn(),
};

const renderItem = (props: { item?: CartItem; isSelected?: boolean } = {}) => {
  return render(
    <CartItemActionsContext.Provider value={mockActions}>
      <Item item={mockItem} isSelected={false} {...props} />
    </CartItemActionsContext.Provider>,
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Item 컴포넌트", () => {
  test("상품명, 가격, 수량이 렌더링된다", () => {
    renderItem();

    expect(screen.getByText("상품 A")).toBeInTheDocument();
    expect(screen.getByText("10,000원")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("+ 버튼 클릭 시 onPlus가 호출된다", async () => {
    renderItem();

    await userEvent.click(screen.getByText("+"));

    expect(mockActions.onPlus).toHaveBeenCalledWith(1);
  });

  test("− 버튼 클릭 시 onMinus가 호출된다", async () => {
    renderItem();

    await userEvent.click(screen.getByText("−"));

    expect(mockActions.onMinus).toHaveBeenCalledWith(1);
  });

  test("삭제 버튼 클릭 시 onDelete가 호출된다", async () => {
    renderItem();

    await userEvent.click(screen.getByText("삭제"));

    expect(mockActions.onDelete).toHaveBeenCalledWith(1);
  });

  test("체크박스 클릭 시 onSelectItem이 호출된다", async () => {
    renderItem();

    await userEvent.click(screen.getByRole("checkbox"));

    expect(mockActions.onSelectItem).toHaveBeenCalledWith(1);
  });

  test("isSelected가 true이면 체크박스가 체크된 상태이다", () => {
    renderItem({ isSelected: true });

    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  test("isSelected가 false이면 체크박스가 체크 해제된 상태이다", () => {
    renderItem({ isSelected: false });

    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
});
