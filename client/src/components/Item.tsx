import styled from "styled-components";
import type { CartItem } from "../type/type";
import { useCartItemActions } from "../context/CartItemActionsContext";

const ItemWrapper = styled.li`
  padding: 16px 20px;
  border-top: 1px solid #eee;
  list-style: none;
`;

const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
`;

const ContentRow = styled.div`
  display: flex;
  gap: 16px;
`;

const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
`;

const ProductInfo = styled.div`
  flex: 1;
`;

const ProductName = styled.p`
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
`;

const ProductPrice = styled.p`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
`;

const QuantityDisplay = styled.span`
  font-size: 16px;
  min-width: 20px;
  text-align: center;
`;

interface ItemProps {
  item: CartItem;
  isSelected: boolean;
}

export const Item = ({ item, isSelected }: ItemProps) => {
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
          <ProductPrice>{item.productPrice.toLocaleString()}원</ProductPrice>
          <QuantityRow>
            <QuantityButton onClick={() => onMinus(item.productId)}>
              −
            </QuantityButton>
            <QuantityDisplay>{item.quantity}</QuantityDisplay>
            <QuantityButton onClick={() => onPlus(item.productId)}>
              +
            </QuantityButton>
          </QuantityRow>
        </ProductInfo>
      </ContentRow>
    </ItemWrapper>
  );
};
