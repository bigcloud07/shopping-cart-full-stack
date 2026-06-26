import styled from "styled-components";

export const ItemWrapper = styled.li`
  padding: 16px 20px;
  border-top: 1px solid #eee;
  list-style: none;
`;

export const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

export const DeleteButton = styled.button`
  padding: 4px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
`;

export const ContentRow = styled.div`
  display: flex;
  gap: 16px;
`;

export const ProductImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
`;

export const ProductInfo = styled.div`
  flex: 1;
`;

export const ProductName = styled.p`
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
`;

export const ProductPrice = styled.p`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
`;

export const QuantityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 16px;
`;

export const QuantityDisplay = styled.span`
  font-size: 16px;
  min-width: 20px;
  text-align: center;
`;

export const QuantityError = styled.p`
  margin-top: 8px;
  color: #d02b2b;
  font-size: 12px;
  font-weight: 600;
`;
