import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 0 20px;
  gap: 12px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
`;

const Description = styled.p`
  font-size: 14px;
  color: #333;
  line-height: 1.6;
`;

const TotalSection = styled.div`
  margin-top: 16px;
`;

const TotalLabel = styled.p`
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const TotalAmount = styled.p`
  font-size: 28px;
  font-weight: bold;
`;

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: #ccc;
`;

const PayButton = styled.button`
  width: 100%;
  padding: 20px;
  background: none;
  border: none;
  color: #000;
  font-size: 16px;
  font-weight: bold;
  cursor: not-allowed;
`;

const Spacer = styled.div`
  height: 80px;
`;

interface OrderConfirmProps {
  itemCount: number;
  totalQuantity: number;
  totalAmount: number;
}

export const OrderConfirm = ({
  itemCount,
  totalQuantity,
  totalAmount,
}: OrderConfirmProps) => {
  return (
    <>
      <Wrapper>
        <Title>주문 확인</Title>
        <Description>
          총 {itemCount}종류의 상품 {totalQuantity}개를 주문합니다.
          <br />
          최종 결제 금액을 확인해 주세요.
        </Description>
        <TotalSection>
          <TotalLabel>총 결제 금액</TotalLabel>
          <TotalAmount>{totalAmount.toLocaleString()}원</TotalAmount>
        </TotalSection>
      </Wrapper>
      <Spacer />
      <BottomBar>
        <PayButton disabled>결제하기</PayButton>
      </BottomBar>
    </>
  );
};
