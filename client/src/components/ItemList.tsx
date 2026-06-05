import type { CartItem } from "../type/type";
import { Item } from "./Item";

interface ItemListProps {
  items: Array<CartItem>;
  onPlus: (item: Pick<CartItem, "productId" | "quantity">) => Promise<void>;
  onMinus: (item: Pick<CartItem, "productId" | "quantity">) => Promise<void>;
  selectedIds: Set<number>;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectItem: (productId: Pick<CartItem, "productId">) => void;
  onDelete: (productId: Pick<CartItem, "productId">) => void;
}

export const ItemList = ({
  items,
  onPlus,
  onMinus,
  onSelectItem,
  onSelectAll,
  onDelete,
  selectedIds,
}: ItemListProps) => {
  console.log(items);

  return (
    <>
      <p>현재 {items.length}종류의 상품이 담겨있습니다.</p>
      <ul>
        <input
          type="checkbox"
          onChange={onSelectAll}
          checked={items.length > 0 && selectedIds.size === items.length}
        ></input>
        <p>전체 선택</p>

        {items.map((item) => (
          <Item
            key={item.productId}
            item={item}
            isSelected={selectedIds.has(item.productId)}
            onPlus={onPlus}
            onMinus={onMinus}
            onSelectItem={onSelectItem}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </>
  );
};
