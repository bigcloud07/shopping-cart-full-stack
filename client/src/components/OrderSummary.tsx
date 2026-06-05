export const OrderSummary = ({
  totalOrderAmount,
}: {
  totalOrderAmount: number;
}) => {
  let shippingFee = 3000;
  const totalPaymentAmount = totalOrderAmount + shippingFee;

  if (totalPaymentAmount >= 100000) {
    shippingFee = 0;
  }

  return (
    <div>
      <div>총 주문 금액이 100,000원 이상일 경우, 무료 배송됩니다.</div>
      <div>주문 금액</div>
      <div>{totalOrderAmount.toLocaleString()}원</div>
      <div>배송비</div>
      <div>{shippingFee.toLocaleString()}원</div>
      <div>총 결제 금액</div>
      <div>{totalPaymentAmount.toLocaleString()}원</div>
    </div>
  );
};
