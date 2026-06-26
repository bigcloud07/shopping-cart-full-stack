import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ItemList } from "../ItemList";
import type { CartItem } from "../../type/type";

const mockItems: CartItem[] = [
  { productId: 1, productName: "상품 A", productImg: "", productPrice: 10000, quantity: 1 },
  { productId: 2, productName: "상품 B", productImg: "", productPrice: 20000, quantity: 2 },
  { productId: 3, productName: "상품 C", productImg: "", productPrice: 30000, quantity: 3 },
];

const mockProps = {
  items: mockItems,
  onPlus: vi.fn(),
  onMinus: vi.fn(),
  onSelectAll: vi.fn(),
  onSelectItem: vi.fn(),
  onDelete: vi.fn(),
  selectedIds: new Set<number>(),
  mutationError: null,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ItemList 컴포넌트", () => {
  test("상품 개수가 텍스트로 표시된다", () => {
    render(<ItemList {...mockProps} />);

    expect(screen.getByText("현재 3종류의 상품이 담겨있습니다.")).toBeInTheDocument();
  });

  test("아이템이 3개 렌더링된다", () => {
    render(<ItemList {...mockProps} />);

    expect(screen.getByText("상품 A")).toBeInTheDocument();
    expect(screen.getByText("상품 B")).toBeInTheDocument();
    expect(screen.getByText("상품 C")).toBeInTheDocument();
  });

  test("전체 상품이 선택된 상태이면 전체선택 체크박스가 체크된 상태이다", () => {
    render(<ItemList {...mockProps} selectedIds={new Set([1, 2, 3])} />);

    expect(screen.getAllByRole("checkbox")[0]).toBeChecked();
  });

  test("일부 상품만 선택된 상태이면 전체선택 체크박스가 체크 해제된 상태이다", () => {
    render(<ItemList {...mockProps} selectedIds={new Set([1])} />);

    expect(screen.getAllByRole("checkbox")[0]).not.toBeChecked();
  });

  test("전체선택 체크박스 클릭 시 onSelectAll이 호출된다", async () => {
    render(<ItemList {...mockProps} />);

    await userEvent.click(screen.getAllByRole("checkbox")[0]);

    expect(mockProps.onSelectAll).toHaveBeenCalled();
  });
});
