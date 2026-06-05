import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { ItemList } from "../components/ItemList";
import { OrderSummary } from "../components/OrderSummary";
import { Title } from "../components/Title";
import type { CartItem, cartItemResponse } from "../type/type";

export const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("selectedIds");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const fetchItems = async () => {
    const response = await fetch("/api/cart");
    const cartItemResponse: cartItemResponse = await response.json();
    const items = cartItemResponse.data.cartItems;

    setCartItems(items);
  };

  useEffect(() => {
    localStorage.setItem(
      "selectedIds",
      JSON.stringify(Array.from(selectedIds)),
    );
  }, [selectedIds]);

  useEffect(() => {
    const initialFetch = async () => {
      const response = await fetch("/api/cart");
      const cartItemResponse: cartItemResponse = await response.json();
      const items = cartItemResponse.data.cartItems;
      setCartItems(items);

      const saved = localStorage.getItem("selectedIds");
      if (saved === null) {
        setSelectedIds(new Set(items.map((item) => item.productId)));
      }
    };

    initialFetch();
  }, []);

  const totalOrderAmount = cartItems.reduce(
    (acc, item) => acc + item.productPrice * item.quantity,
    0,
  );

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
      <Header />
      <Title />
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
      <button disabled={selectedIds.size === 0}>주문 확인</button>{" "}
    </>
  );
};
