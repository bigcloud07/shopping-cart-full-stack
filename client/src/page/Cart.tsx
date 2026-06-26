import { useState } from "react";
import {
  BottomBar,
  CenterBox,
  OrderButton,
  Spacer,
} from "../components/styled/Cart.styles";
import { Header } from "../components/Header";
import { ItemList } from "../components/ItemList";
import { OrderConfirm } from "../components/OrderConfirm";
import { OrderSummary } from "../components/OrderSummary";
import { Spinner } from "../components/Spinner";
import { Title } from "../components/Title";
import { useCart } from "../hooks/useCart";
import { useSelectedIds } from "../hooks/useSelectedIds";
import { useOrderCalculation } from "../hooks/useOrderCalculation";

export const Cart = () => {
  const {
    cartItems,
    isLoading,
    loadError,
    mutationError,
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
    shippingFee,
    totalPaymentAmount,
  } = useOrderCalculation(cartItems, selectedIds);

  const onPlus = async (productId: number) => {
    const result = await increaseQuantity(productId);
    if (result.status === "blocked" && result.reason === "MAX_QUANTITY") {
      alert("수량은 최대 99개까지 가능합니다.");
      return;
    }
  };

  const onMinus = async (productId: number) => {
    const result = await decreaseQuantity(productId);
    if (result.status === "blocked" && result.reason === "MIN_QUANTITY") {
      alert("수량은 1개 이상부터 가능합니다.");
      return;
    }
  };

  const onDelete = async (productId: number) => {
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

  if (loadError) {
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
      <Title>{isConfirming ? "주문 확인" : "장바구니"}</Title>
      {isConfirming ? (
        <OrderConfirm
          items={selectedItems}
          itemCount={selectedItems.length}
          totalQuantity={totalQuantity}
          onReturnToCart={() => setIsConfirming(false)}
        />
      ) : (
        <>
          <ItemList
            items={cartItems}
            onPlus={onPlus}
            onMinus={onMinus}
            selectedIds={selectedIds}
            mutationError={mutationError}
            onSelectAll={onSelectAll}
            onSelectItem={onSelectItem}
            onDelete={onDelete}
          />
          <OrderSummary
            totalOrderAmount={totalOrderAmount}
            shippingFee={shippingFee}
            totalPaymentAmount={totalPaymentAmount}
          />
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
