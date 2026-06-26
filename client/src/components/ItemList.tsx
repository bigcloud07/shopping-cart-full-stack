import {
  Checkbox,
  List,
  SelectAllLabel,
  SelectAllRow,
  Subtitle,
} from "./styled/ItemList.styles";
import type { CartItem } from "../type/type";
import { Item } from "./Item";
import { CartItemActionsContext } from "../context/CartItemActionsContext";

interface ItemMutationError {
  productId: number;
  message: string;
}

interface ItemListProps {
  items: Array<CartItem>;
  onPlus: (productId: number) => Promise<void>;
  onMinus: (productId: number) => Promise<void>;
  selectedIds: Set<number>;
  mutationError: ItemMutationError | null;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectItem: (productId: number) => void;
  onDelete: (productId: number) => void;
}

export const ItemList = ({
  items,
  onPlus,
  onMinus,
  onSelectItem,
  onSelectAll,
  onDelete,
  selectedIds,
  mutationError,
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
      <CartItemActionsContext.Provider
        value={{ onPlus, onMinus, onSelectItem, onDelete }}
      >
        <List>
          {items.map((item) => (
            <Item
              key={item.productId}
              item={item}
              isSelected={selectedIds.has(item.productId)}
              mutationErrorMessage={
                mutationError?.productId === item.productId
                  ? mutationError.message
                  : undefined
              }
            />
          ))}
        </List>
      </CartItemActionsContext.Provider>
    </div>
  );
};
