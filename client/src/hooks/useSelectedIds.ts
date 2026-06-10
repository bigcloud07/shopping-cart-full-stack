import { useEffect, useRef, useState } from "react";
import type { CartItem } from "../type/type";

const STORAGE_KEY = "selectedIds";

const loadSelectedIds = (): Set<number> | null => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? new Set(JSON.parse(saved)) : null;
};

interface UseSelectedIdsReturn {
  selectedIds: Set<number>;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectItem: (productId: number) => void;
  removeSelectedId: (productId: number) => void;
}

export const useSelectedIds = (cartItems: CartItem[]): UseSelectedIdsReturn => {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(
    () => loadSelectedIds() ?? new Set(),
  );

  const hadSavedSelectionRef = useRef(loadSelectedIds() !== null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current || cartItems.length === 0) {
      return;
    }
    isInitializedRef.current = true;

    if (!hadSavedSelectionRef.current) {
      setSelectedIds(new Set(cartItems.map((item) => item.productId)));
    }
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(selectedIds)));
  }, [selectedIds]);

  const onSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(cartItems.map((item) => item.productId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const onSelectItem = (productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const removeSelectedId = (productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  return { selectedIds, onSelectAll, onSelectItem, removeSelectedId };
};
