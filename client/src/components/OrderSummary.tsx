import styled from "styled-components";
import { FREE_SHIPPING_THRESHOLD } from "../utils/shippingFee";

const Wrapper = styled.div`
  border-top: 1px solid #eee;
  margin-top: 8px;
`;

const InfoText = styled.p`
  padding: 14px 20px;
  font-size: 13px;
  color: #555;
`;

const RowList = styled.div`
  border-top: 1px solid #eee;
`;

const Row = styled.div<{ $bold?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: ${({ $bold }) => ($bold ? "1px solid #eee" : "none")};
`;

const Label = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

const Amount = styled.span<{ $large?: boolean }>`
  font-size: ${({ $large }) => ($large ? "18px" : "16px")};
  font-weight: bold;
`;

interface OrderSummaryProps {
  totalOrderAmount: number;
  shippingFee: number;
  totalPaymentAmount: number;
}

export const OrderSummary = ({
  totalOrderAmount,
  shippingFee,
  totalPaymentAmount,
}: OrderSummaryProps) => {
  return (
    <Wrapper>
      <InfoText>
        ⓘ 총 주문 금액이 {FREE_SHIPPING_THRESHOLD.toLocaleString()}원 이상일
        경우, 무료 배송됩니다.
      </InfoText>
      <RowList>
        <Row>
          <Label>주문 금액</Label>
          <Amount>{totalOrderAmount.toLocaleString()}원</Amount>
        </Row>
        <Row>
          <Label>배송비</Label>
          <Amount>{shippingFee.toLocaleString()}원</Amount>
        </Row>
        <Row $bold>
          <Label>총 결제 금액</Label>
          <Amount $large>{totalPaymentAmount.toLocaleString()}원</Amount>
        </Row>
      </RowList>
    </Wrapper>
  );
};
