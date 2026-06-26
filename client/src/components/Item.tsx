import {
  Checkbox,
  ContentRow,
  DeleteButton,
  ItemWrapper,
  ProductImage,
  ProductInfo,
  ProductName,
  ProductPrice,
  QuantityError,
  QuantityButton,
  QuantityDisplay,
  QuantityRow,
  TopRow,
} from "./styled/Item.styles";
import type { CartItem } from "../type/type";
import { useCartItemActions } from "../context/CartItemActionsContext";

interface ItemProps {
  item: CartItem;
  isSelected: boolean;
  mutationErrorMessage?: string;
}

export const Item = ({ item, isSelected, mutationErrorMessage }: ItemProps) => {
  const { onPlus, onMinus, onSelectItem, onDelete } = useCartItemActions();
  return (
    <ItemWrapper>
      <TopRow>
        <Checkbox
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectItem(item.productId)}
        />
        <DeleteButton onClick={() => onDelete(item.productId)}>
          삭제
        </DeleteButton>
      </TopRow>
      <ContentRow>
        <ProductImage
          src={item.productImg || undefined}
          alt={item.productName}
        />
        <ProductInfo>
          <ProductName>{item.productName}</ProductName>
          <ProductPrice>
            {item.productPrice.toLocaleString()}원
          </ProductPrice>
          <QuantityRow>
            <QuantityButton onClick={() => onMinus(item.productId)}>
              −
            </QuantityButton>
            <QuantityDisplay>{item.quantity}</QuantityDisplay>
            <QuantityButton onClick={() => onPlus(item.productId)}>
              +
            </QuantityButton>
          </QuantityRow>
          {mutationErrorMessage && (
            <QuantityError role="alert">{mutationErrorMessage}</QuantityError>
          )}
        </ProductInfo>
      </ContentRow>
    </ItemWrapper>
  );
};
