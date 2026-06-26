import { useCallback, useEffect, useRef, useState } from "react";
import { requestApplyCoupons, requestOrderSummary } from "../api/orderApi";
import type {
  CartItem,
  CouponAvailability,
  CouponCode,
  OrderLine,
  OrderSummaryData,
} from "../type/type";
import {
  alignSummaryItemOrder,
  buildFallbackSummary,
  toOrderLine,
} from "../utils/orderSummary";
import {
  MAX_COUPON_COUNT,
  useCouponSelection,
} from "./useCouponSelection";

export { MAX_COUPON_COUNT };

interface UseOrderConfirmReturn {
  summary: OrderSummaryData;
  orderItems: OrderLine[];
  totalDiscountAmount: number;
  displayTotalAmount: number;
  isLoadingOrder: boolean;
  isRemoteArea: boolean;
  changeRemoteArea: (nextIsRemoteArea: boolean) => void;
  coupons: CouponAvailability[];
  draftCouponCodes: CouponCode[];
  selectedCouponDiscount: number;
  isCouponModalOpen: boolean;
  isLoadingCoupons: boolean;
  openCouponModal: () => void;
  closeCouponModal: () => void;
  toggleCoupon: (coupon: CouponAvailability) => void;
  applyCoupons: () => Promise<void>;
  errorMessage: string;
}

export const useOrderConfirm = (items: CartItem[]): UseOrderConfirmReturn => {
  const [isRemoteArea, setIsRemoteArea] = useState(false);
  const [summary, setSummary] = useState<OrderSummaryData>(() =>
    buildFallbackSummary(items, false),
  );
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const selectedCouponCodesRef = useRef<CouponCode[]>([]);
  const applySummary = useCallback(
    (nextSummary: OrderSummaryData) => {
      setSummary(alignSummaryItemOrder(nextSummary, items));
    },
    [items],
  );
  const {
    coupons,
    draftCouponCodes,
    selectedCouponDiscount,
    isCouponModalOpen,
    isLoadingCoupons,
    openCouponModal,
    closeCouponModal,
    toggleCoupon,
    applyCoupons,
    resetDraftToSelected,
  } = useCouponSelection({
    items,
    isRemoteArea,
    selectedCouponCodes: summary.selectedCouponCodes,
    onApplySuccess: applySummary,
    onError: setErrorMessage,
  });

  useEffect(() => {
    selectedCouponCodesRef.current = summary.selectedCouponCodes;
  }, [summary.selectedCouponCodes]);

  useEffect(() => {
    let ignore = false;

    const loadOrder = async () => {
      const selectedCouponCodes = selectedCouponCodesRef.current;
      const fallbackSummary = buildFallbackSummary(items, isRemoteArea);
      setSummary((prev) =>
        selectedCouponCodes.length > 0
          ? { ...prev, isRemoteArea }
          : fallbackSummary,
      );
      setIsLoadingOrder(true);
      setErrorMessage("");
      try {
        const nextSummary =
          selectedCouponCodes.length > 0
            ? await requestApplyCoupons(items, isRemoteArea, selectedCouponCodes)
            : await requestOrderSummary(items, isRemoteArea);
        if (!ignore) {
          applySummary(nextSummary);
        }
      } catch (error) {
        if (!ignore) {
          setSummary((prev) =>
            selectedCouponCodes.length > 0
              ? { ...prev, isRemoteArea }
              : buildFallbackSummary(items, isRemoteArea),
          );
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "주문 정보를 불러오지 못했습니다.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingOrder(false);
        }
      }
    };

    loadOrder();

    return () => {
      ignore = true;
    };
  }, [items, isRemoteArea, applySummary]);

  const changeRemoteArea = (nextIsRemoteArea: boolean) => {
    const selectedCouponCodes = selectedCouponCodesRef.current;
    setIsRemoteArea(nextIsRemoteArea);
    resetDraftToSelected();
    setSummary((prev) =>
      selectedCouponCodes.length > 0
        ? { ...prev, isRemoteArea: nextIsRemoteArea }
        : buildFallbackSummary(items, nextIsRemoteArea),
    );
  };

  const orderItems =
    summary.orderItems.length > 0 ? summary.orderItems : items.map(toOrderLine);
  const totalDiscountAmount = summary.price.totalDiscountAmount;
  const displayTotalAmount = summary.price.finalPaymentAmount;

  return {
    summary,
    orderItems,
    totalDiscountAmount,
    displayTotalAmount,
    isLoadingOrder,
    isRemoteArea,
    changeRemoteArea,
    coupons,
    draftCouponCodes,
    selectedCouponDiscount,
    isCouponModalOpen,
    isLoadingCoupons,
    openCouponModal,
    closeCouponModal,
    toggleCoupon,
    applyCoupons,
    errorMessage,
  };
};
