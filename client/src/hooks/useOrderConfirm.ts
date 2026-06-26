import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  requestApplyCoupons,
  requestCoupons,
  requestOrderSummary,
} from "../api/orderApi";
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
  buildOptimisticCoupons,
  buildOptimisticCouponSummary,
  toOrderLine,
} from "../utils/orderSummary";

export const MAX_COUPON_COUNT = 2;

const hasSameCouponCodes = (
  currentCouponCodes: CouponCode[],
  nextCouponCodes: CouponCode[],
) => {
  if (currentCouponCodes.length !== nextCouponCodes.length) return false;

  return currentCouponCodes.every(
    (couponCode, index) => couponCode === nextCouponCodes[index],
  );
};

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
  const [coupons, setCoupons] = useState<CouponAvailability[]>([]);
  const [recommendedCouponCodes, setRecommendedCouponCodes] = useState<
    CouponCode[]
  >([]);
  const [draftCouponCodes, setDraftCouponCodes] = useState<CouponCode[]>([]);
  const [appliedCouponCodes, setAppliedCouponCodes] = useState<CouponCode[]>(
    [],
  );
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const couponRequestIdRef = useRef(0);
  const isCouponModalOpenRef = useRef(false);

  useEffect(() => {
    isCouponModalOpenRef.current = isCouponModalOpen;
  }, [isCouponModalOpen]);

  const syncDraftCouponCodes = useCallback(
    (nextCouponCodes: CouponCode[]) => {
      setDraftCouponCodes((prev) => {
        if (hasSameCouponCodes(prev, nextCouponCodes)) {
          return prev;
        }

        if (isCouponModalOpenRef.current) {
          return prev;
        }

        return nextCouponCodes;
      });
    },
    [],
  );

  const loadCoupons = useCallback(
    async (showLoading = false) => {
      const requestId = couponRequestIdRef.current + 1;
      couponRequestIdRef.current = requestId;

      if (showLoading) {
        setIsLoadingCoupons(true);
      }

      try {
        const couponData = await requestCoupons(items, isRemoteArea);

        if (couponRequestIdRef.current !== requestId) return;

        setCoupons(couponData.coupons);
        setRecommendedCouponCodes(couponData.bestCouponCodes);
        syncDraftCouponCodes(
          appliedCouponCodes.length > 0
            ? appliedCouponCodes
            : couponData.bestCouponCodes,
        );
      } catch (error) {
        if (couponRequestIdRef.current !== requestId) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "쿠폰 정보를 불러오지 못했습니다.",
        );
      } finally {
        if (couponRequestIdRef.current === requestId) {
          setIsLoadingCoupons(false);
        }
      }
    },
    [items, isRemoteArea, appliedCouponCodes, syncDraftCouponCodes],
  );

  useEffect(() => {
    let ignore = false;

    const loadOrder = async () => {
      const fallbackSummary = buildFallbackSummary(items, isRemoteArea);
      setSummary((prev) =>
        appliedCouponCodes.length > 0
          ? { ...prev, isRemoteArea }
          : fallbackSummary,
      );
      setIsLoadingOrder(true);
      setErrorMessage("");
      try {
        const nextSummary =
          appliedCouponCodes.length > 0
            ? await requestApplyCoupons(items, isRemoteArea, appliedCouponCodes)
            : await requestOrderSummary(items, isRemoteArea);
        if (!ignore) {
          setSummary(alignSummaryItemOrder(nextSummary, items));
        }
      } catch (error) {
        if (!ignore) {
          setSummary((prev) =>
            appliedCouponCodes.length > 0
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
  }, [items, isRemoteArea, appliedCouponCodes]);

  useEffect(() => {
    let ignore = false;
    const requestId = couponRequestIdRef.current + 1;
    couponRequestIdRef.current = requestId;

    const preloadCoupons = async () => {
      try {
        const couponData = await requestCoupons(items, isRemoteArea);

        if (ignore || couponRequestIdRef.current !== requestId) return;

        setCoupons(couponData.coupons);
        setRecommendedCouponCodes(couponData.bestCouponCodes);
        syncDraftCouponCodes(
          appliedCouponCodes.length > 0
            ? appliedCouponCodes
            : couponData.bestCouponCodes,
        );
      } catch (error) {
        if (ignore || couponRequestIdRef.current !== requestId) return;

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "쿠폰 정보를 불러오지 못했습니다.",
        );
      }
    };

    void preloadCoupons();

    return () => {
      ignore = true;
    };
  }, [items, isRemoteArea, appliedCouponCodes, syncDraftCouponCodes]);

  const selectedCouponDiscount = useMemo(
    () =>
      coupons
        .filter(({ coupon }) => draftCouponCodes.includes(coupon.code))
        .reduce((total, { expectedDiscountAmount }) => {
          return total + expectedDiscountAmount;
        }, 0),
    [coupons, draftCouponCodes],
  );

  const openCouponModal = () => {
    setIsCouponModalOpen(true);
    setErrorMessage("");

    if (coupons.length === 0) {
      const optimisticCouponData = buildOptimisticCoupons(
        items,
        summary.price.shippingFee,
      );
      setCoupons(optimisticCouponData.coupons);
      setRecommendedCouponCodes(optimisticCouponData.bestCouponCodes);
      setDraftCouponCodes(
        appliedCouponCodes.length > 0
          ? appliedCouponCodes
          : optimisticCouponData.bestCouponCodes,
      );
      void loadCoupons(false);
    } else {
      setDraftCouponCodes(
        appliedCouponCodes.length > 0
          ? appliedCouponCodes
          : recommendedCouponCodes,
      );
    }
  };

  const closeCouponModal = () => setIsCouponModalOpen(false);

  const toggleCoupon = (coupon: CouponAvailability) => {
    if (!coupon.isAvailable) return;

    setDraftCouponCodes((prev) => {
      if (prev.includes(coupon.coupon.code)) {
        return prev.filter((code) => code !== coupon.coupon.code);
      }

      if (prev.length >= MAX_COUPON_COUNT) {
        return prev;
      }

      return [...prev, coupon.coupon.code];
    });
  };

  const applyCoupons = async () => {
    const previousSummary = summary;
    setSummary(
      buildOptimisticCouponSummary(summary, coupons, draftCouponCodes),
    );
    setIsCouponModalOpen(false);
    setIsLoadingCoupons(true);
    setErrorMessage("");
    try {
      const nextSummary = await requestApplyCoupons(
        items,
        isRemoteArea,
        draftCouponCodes,
      );
      setSummary(alignSummaryItemOrder(nextSummary, items));
      setAppliedCouponCodes(nextSummary.selectedCouponCodes);
      setDraftCouponCodes(nextSummary.selectedCouponCodes);
    } catch (error) {
      setSummary(previousSummary);
      setErrorMessage(
        error instanceof Error ? error.message : "쿠폰 적용에 실패했습니다.",
      );
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const changeRemoteArea = (nextIsRemoteArea: boolean) => {
    setIsRemoteArea(nextIsRemoteArea);
    setDraftCouponCodes(appliedCouponCodes);
    setSummary((prev) =>
      appliedCouponCodes.length > 0
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
