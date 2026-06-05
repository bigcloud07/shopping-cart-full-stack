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
    <div>
      <h2>주문 확인</h2>
      <p>총 {itemCount}종류의 상품 {totalQuantity}개를 주문합니다.</p>
      <p>최종 결제 금액을 확인해 주세요.</p>
      <div>총 결제 금액</div>
      <div>{totalAmount.toLocaleString()}원</div>
      <button disabled>결제하기</button>
    </div>
  );
};
