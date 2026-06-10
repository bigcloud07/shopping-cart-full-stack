import styled from "styled-components";
import type { CartItem } from "../type/type";
import { Item } from "./Item";

const Subtitle = styled.p`
  padding: 0 20px 16px;
  color: #555;
  font-size: 14px;
`;

const SelectAllRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #eee;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const SelectAllLabel = styled.span`
  font-size: 14px;
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
`;

interface ItemListProps {
  items: Array<CartItem>;
  onPlus: (item: Pick<CartItem, "productId">) => Promise<void>;
  onMinus: (item: Pick<CartItem, "productId">) => Promise<void>;
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
  return (
    <div>
      <Subtitle>현재 {items.length}종류의 상품이 담겨있습니다.</Subtitle>
      <SelectAllRow>
        <Checkbox
          type="checkbox"
          onChange={onSelectAll}
          checked={items.length > 0 && selectedIds.size === items.length}
        />
        <SelectAllLabel>전체선택</SelectAllLabel>
      </SelectAllRow>
      <List>
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
      </List>
    </div>
  );
};
