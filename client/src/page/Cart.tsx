import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { ItemList } from "../components/ItemList";
import { OrderConfirm } from "../components/OrderConfirm";
import { OrderSummary } from "../components/OrderSummary";
import { Spinner } from "../components/Spinner";
import { Title } from "../components/Title";
import type { CartItem, cartItemResponse } from "../type/type";

export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("selectedIds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const fetchItems = async () => {
    setIsLoading(true);
    const response = await fetch("/api/cart");
    const cartItemResponse: cartItemResponse = await response.json();
    const items = cartItemResponse.data.cartItems;

    setCartItems(items);
    setIsLoading(false);
  };

  useEffect(() => {
    localStorage.setItem(
      "selectedIds",
      JSON.stringify(Array.from(selectedIds)),
    );
  }, [selectedIds]);

  useEffect(() => {
    const initialFetch = async () => {
      setIsLoading(true);
      const response = await fetch("/api/cart");
      const cartItemResponse: cartItemResponse = await response.json();
      const items = cartItemResponse.data.cartItems;
      setCartItems(items);

      const saved = localStorage.getItem("selectedIds");
      if (saved === null) {
        setSelectedIds(new Set(items.map((item) => item.productId)));
      }
      setIsLoading(false);
    };

    initialFetch();
  }, []);

  const selectedItems = cartItems.filter((item) => selectedIds.has(item.productId));
  const totalOrderAmount = selectedItems.reduce(
    (acc, item) => acc + item.productPrice * item.quantity, 0
  );
  const totalQuantity = selectedItems.reduce((acc, item) => acc + item.quantity, 0);
  const shippingFee = totalOrderAmount >= 100000 ? 0 : 3000;
  const totalPaymentAmount = totalOrderAmount + shippingFee;

  const onPlus = async ({
    productId,
    quantity,
  }: Pick<CartItem, "productId" | "quantity">) => {
    await fetch(`/api/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: quantity + 1 }),
    });
    fetchItems();
  };

  const onMinus = async ({
    productId,
    quantity,
  }: Pick<CartItem, "productId" | "quantity">) => {
    await fetch(`/api/cart/${productId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: quantity - 1 }),
    });
    fetchItems();
  };

  const onSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(cartItems.map((item) => item.productId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const onSelectItem = ({ productId }: Pick<CartItem, "productId">) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const onDelete = async ({ productId }: Pick<CartItem, "productId">) => {
    await fetch(`/api/cart/${productId}`, {
      method: "DELETE",
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
    fetchItems();
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <Title />
        <Spinner />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <Header />
        <Title />
        <div>장바구니에 상품이 없습니다.</div>
      </>
    );
  }

  return (
    <>
      <Header onBack={isConfirming ? () => setIsConfirming(false) : undefined} />
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
          <button
            disabled={selectedIds.size === 0}
            onClick={() => setIsConfirming(true)}
          >
            주문 확인
          </button>
        </>
      )}
    </>
  );
};
