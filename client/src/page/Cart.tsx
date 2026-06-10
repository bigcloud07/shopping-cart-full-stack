import { useState } from "react";
import styled from "styled-components";
import { Header } from "../components/Header";
import { ItemList } from "../components/ItemList";
import { OrderConfirm } from "../components/OrderConfirm";
import { OrderSummary } from "../components/OrderSummary";
import { Spinner } from "../components/Spinner";
import { Title } from "../components/Title";
import type { CartItem } from "../type/type";
import { useCart } from "../hooks/useCart";
import { useSelectedIds } from "../hooks/useSelectedIds";
import { useOrderCalculation } from "../hooks/useOrderCalculation";

const CenterBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 16px;
  color: #555;
`;

const Spacer = styled.div`
  height: 80px;
`;

const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: #000;
`;

const OrderButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`;

export const Cart = () => {
  const {
    cartItems,
    isLoading,
    error,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
  } = useCart();
  const [isConfirming, setIsConfirming] = useState(false);
  const { selectedIds, onSelectAll, onSelectItem, removeSelectedId } =
    useSelectedIds(cartItems);

  const {
    selectedItems,
    totalOrderAmount,
    totalQuantity,
    totalPaymentAmount,
  } = useOrderCalculation(cartItems, selectedIds);

  const onPlus = async ({ productId }: Pick<CartItem, "productId">) => {
    const item = cartItems.find((item) => item.productId === productId);
    if (!item) return;

    if (item.quantity >= 99) {
      alert("수량은 최대 99개까지 가능합니다.");
      return;
    }
    await increaseQuantity(productId, item.quantity);
  };

  const onMinus = async ({ productId }: Pick<CartItem, "productId">) => {
    const item = cartItems.find((item) => item.productId === productId);
    if (!item) return;

    const success = await decreaseQuantity(productId, item.quantity);
    if (!success) {
      alert("수량은 1개 이상부터 가능합니다.");
    }
  };

  const onDelete = async ({ productId }: Pick<CartItem, "productId">) => {
    await removeItem(productId);
    removeSelectedId(productId);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Title />
        <CenterBox>
          <Spinner />
        </CenterBox>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <Title />
        <CenterBox>장바구니를 불러오지 못했습니다.</CenterBox>
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <Title />
        <CenterBox>장바구니에 상품이 없습니다.</CenterBox>
      </>
    );
  }

  return (
    <>
      <Header
        onBack={isConfirming ? () => setIsConfirming(false) : undefined}
      />
      <Title />
      {isConfirming ? (
        <OrderConfirm
          itemCount={selectedItems.length}
          totalQuantity={totalQuantity}
          totalAmount={totalPaymentAmount}
        />
      ) : (
        <>
          <ItemList
            items={cartItems}
            onPlus={onPlus}
            onMinus={onMinus}
            selectedIds={selectedIds}
            onSelectAll={onSelectAll}
            onSelectItem={onSelectItem}
            onDelete={onDelete}
          />
          <OrderSummary totalOrderAmount={totalOrderAmount} />
          <Spacer />
          <BottomBar>
            <OrderButton
              $disabled={selectedItems.length === 0}
              disabled={selectedItems.length === 0}
              onClick={() => setIsConfirming(true)}
            >
              주문 확인
            </OrderButton>
          </BottomBar>
        </>
      )}
    </>
  );
};
