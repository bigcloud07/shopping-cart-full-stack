import {
  Amount,
  InfoText,
  Label,
  Row,
  RowList,
  Wrapper,
} from "./styled/OrderSummary.styles";
import { FREE_SHIPPING_THRESHOLD } from "../utils/shippingFee";

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
