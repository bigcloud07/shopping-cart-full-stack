import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { requestApplyCoupons, requestCoupons } from "../api/orderApi";
import type {
  CartItem,
  CouponAvailability,
  CouponCode,
  OrderSummaryData,
} from "../type/type";

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

interface UseCouponSelectionParams {
  items: CartItem[];
  isRemoteArea: boolean;
  onApplySuccess: (summary: OrderSummaryData) => void;
  onError: (message: string) => void;
}

interface UseCouponSelectionReturn {
  coupons: CouponAvailability[];
  draftCouponCodes: CouponCode[];
  appliedCouponCodes: CouponCode[];
  selectedCouponDiscount: number;
  isCouponModalOpen: boolean;
  isLoadingCoupons: boolean;
  openCouponModal: () => void;
  closeCouponModal: () => void;
  toggleCoupon: (coupon: CouponAvailability) => void;
  applyCoupons: () => Promise<void>;
  resetDraftToApplied: () => void;
}

export const useCouponSelection = ({
  items,
  isRemoteArea,
  onApplySuccess,
  onError,
}: UseCouponSelectionParams): UseCouponSelectionReturn => {
  const [coupons, setCoupons] = useState<CouponAvailability[]>([]);
  const [recommendedCouponCodes, setRecommendedCouponCodes] = useState<
    CouponCode[]
  >([]);
  const [draftCouponCodes, setDraftCouponCodes] = useState<CouponCode[]>([]);
  const [appliedCouponCodes, setAppliedCouponCodes] = useState<CouponCode[]>(
    [],
  );
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const couponRequestIdRef = useRef(0);
  const isCouponModalOpenRef = useRef(false);

  useEffect(() => {
    isCouponModalOpenRef.current = isCouponModalOpen;
  }, [isCouponModalOpen]);

  const getBaseCouponCodes = useCallback(
    (nextRecommendedCouponCodes = recommendedCouponCodes) =>
      appliedCouponCodes.length > 0
        ? appliedCouponCodes
        : nextRecommendedCouponCodes,
    [appliedCouponCodes, recommendedCouponCodes],
  );

  const syncDraftCouponCodes = useCallback((nextCouponCodes: CouponCode[]) => {
    setDraftCouponCodes((prev) => {
      if (hasSameCouponCodes(prev, nextCouponCodes)) {
        return prev;
      }

      if (isCouponModalOpenRef.current) {
        return prev;
      }

      return nextCouponCodes;
    });
  }, []);

  const loadCoupons = useCallback(
    async (showLoading = false, syncWhileModalOpen = false) => {
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

        const nextCouponCodes = getBaseCouponCodes(couponData.bestCouponCodes);
        if (syncWhileModalOpen) {
          setDraftCouponCodes(nextCouponCodes);
        } else {
          syncDraftCouponCodes(nextCouponCodes);
        }
      } catch (error) {
        if (couponRequestIdRef.current !== requestId) return;

        onError(
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
    [items, isRemoteArea, getBaseCouponCodes, onError, syncDraftCouponCodes],
  );

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
        syncDraftCouponCodes(getBaseCouponCodes(couponData.bestCouponCodes));
      } catch (error) {
        if (ignore || couponRequestIdRef.current !== requestId) return;

        onError(
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
  }, [items, isRemoteArea, getBaseCouponCodes, onError, syncDraftCouponCodes]);

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
    onError("");
    setDraftCouponCodes(getBaseCouponCodes());

    if (coupons.length === 0) {
      void loadCoupons(true, true);
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
    setIsCouponModalOpen(false);
    setIsLoadingCoupons(true);
    onError("");

    try {
      const nextSummary = await requestApplyCoupons(
        items,
        isRemoteArea,
        draftCouponCodes,
      );
      onApplySuccess(nextSummary);
      setAppliedCouponCodes(nextSummary.selectedCouponCodes);
      setDraftCouponCodes(nextSummary.selectedCouponCodes);
    } catch (error) {
      onError(
        error instanceof Error ? error.message : "쿠폰 적용에 실패했습니다.",
      );
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const resetDraftToApplied = () => {
    setDraftCouponCodes(appliedCouponCodes);
  };

  return {
    coupons,
    draftCouponCodes,
    appliedCouponCodes,
    selectedCouponDiscount,
    isCouponModalOpen,
    isLoadingCoupons,
    openCouponModal,
    closeCouponModal,
    toggleCoupon,
    applyCoupons,
    resetDraftToApplied,
  };
};
