import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BottomBar,
  CenterMessage,
  Checkbox,
  CheckLabel,
  CloseButton,
  CompleteAmount,
  CompleteAmountLabel,
  CompleteDescription,
  CompleteTitle,
  CouponButton,
  CouponGuide,
  CouponItem,
  CouponList,
  CouponMeta,
  CouponName,
  Description,
  InfoText,
  ItemList,
  ItemRow,
  Modal,
  ModalApplyButton,
  ModalHeader,
  ModalTitle,
  NegativeAmount,
  Overlay,
  Page,
  PriceRow,
  PriceRows,
  PrimaryButton,
  ProductImage,
  ProductInfo,
  ProductName,
  ProductPrice,
  ProductQuantity,
  Section,
  SectionTitle,
} from "./styled/OrderConfirm.styles";
import {
  requestApplyCoupons,
  requestCoupons,
  requestOrderSummary,
} from "../api/orderApi";
import type {
  CartItem,
  CouponAvailability,
  CouponCode,
  OrderSummaryData,
} from "../type/type";
import {
  alignSummaryItemOrder,
  buildFallbackSummary,
  buildOptimisticCoupons,
  buildOptimisticCouponSummary,
  enforceShippingPolicy,
  formatCouponDetail,
  toOrderLine,
} from "../utils/orderSummary";

const MAX_COUPON_COUNT = 2;

const formatWon = (amount: number) => `${amount.toLocaleString()}원`;

const hasSameCouponCodes = (
  currentCouponCodes: CouponCode[],
  nextCouponCodes: CouponCode[],
) => {
  if (currentCouponCodes.length !== nextCouponCodes.length) return false;

  return currentCouponCodes.every(
    (couponCode, index) => couponCode === nextCouponCodes[index],
  );
};

interface OrderConfirmProps {
  items: CartItem[];
  itemCount: number;
  totalQuantity: number;
  onReturnToCart: () => void;
}

export const OrderConfirm = ({
  items,
  itemCount,
  totalQuantity,
  onReturnToCart,
}: OrderConfirmProps) => {
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
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
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
          ? enforceShippingPolicy(prev, isRemoteArea)
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
          setSummary(
            enforceShippingPolicy(
              alignSummaryItemOrder(nextSummary, items),
              isRemoteArea,
            ),
          );
        }
      } catch (error) {
        if (!ignore) {
          setSummary((prev) =>
            appliedCouponCodes.length > 0
              ? enforceShippingPolicy(prev, isRemoteArea)
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
      const optimisticCouponData = buildOptimisticCoupons(items, isRemoteArea);
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
      setSummary(
        enforceShippingPolicy(
          alignSummaryItemOrder(nextSummary, items),
          isRemoteArea,
        ),
      );
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
        ? enforceShippingPolicy(prev, nextIsRemoteArea)
        : buildFallbackSummary(items, nextIsRemoteArea),
    );
  };

  const orderItems =
    summary.orderItems.length > 0 ? summary.orderItems : items.map(toOrderLine);
  const totalDiscountAmount = summary.price.totalDiscountAmount;
  const displayTotalAmount = summary.price.finalPaymentAmount;

  if (isPaymentConfirmed) {
    return (
      <>
        <CenterMessage>
          <CompleteTitle>결제 확인</CompleteTitle>
          <CompleteDescription>
            총 {itemCount}종류의 상품 {totalQuantity}개를 주문했습니다.
            <br />
            최종 결제 금액을 확인해 주세요.
          </CompleteDescription>
          <CompleteAmountLabel>총 결제 금액</CompleteAmountLabel>
          <CompleteAmount>{formatWon(displayTotalAmount)}</CompleteAmount>
        </CenterMessage>
        <BottomBar>
          <PrimaryButton onClick={onReturnToCart}>
            장바구니로 돌아가기
          </PrimaryButton>
        </BottomBar>
      </>
    );
  }

  return (
    <>
      <Page>
        <Description>
          총 {itemCount}종류의 상품 {totalQuantity}개를 주문합니다.
          <br />
          최종 결제 금액을 확인해 주세요.
        </Description>

        {errorMessage && <InfoText role="alert">{errorMessage}</InfoText>}

        <Section>
          <ItemList>
            {orderItems.map((item) => (
              <ItemRow key={item.productId}>
                <ProductImage
                  src={item.productImg || undefined}
                  alt={item.productName}
                />
                <ProductInfo>
                  <ProductName>{item.productName}</ProductName>
                  <ProductPrice>{formatWon(item.productPrice)}</ProductPrice>
                  <ProductQuantity>{item.quantity}개</ProductQuantity>
                </ProductInfo>
              </ItemRow>
            ))}
          </ItemList>
          <CouponButton onClick={openCouponModal}>쿠폰 적용</CouponButton>
        </Section>

        <Section>
          <SectionTitle>배송 정보</SectionTitle>
          <CheckLabel>
            <Checkbox
              type="checkbox"
              checked={isRemoteArea}
              onChange={(event) => {
                changeRemoteArea(event.target.checked);
              }}
            />
            제주도 및 도서 산간 지역
          </CheckLabel>
          <InfoText>
            ⓘ 총 주문 금액이 100,000원 이상일 경우, 무료 배송됩니다.
          </InfoText>
        </Section>

        <Section>
          <PriceRows>
            <PriceRow>
              <span>주문 금액</span>
              <span>{formatWon(summary.price.orderAmount)}</span>
            </PriceRow>
            <PriceRow>
              <span>쿠폰 할인 금액</span>
              <NegativeAmount>
                -{formatWon(totalDiscountAmount)}
              </NegativeAmount>
            </PriceRow>
            <PriceRow>
              <span>배송비</span>
              <span>{formatWon(summary.price.shippingFee)}</span>
            </PriceRow>
            <PriceRow $strong>
              <span>총 결제 금액</span>
              <span>{formatWon(displayTotalAmount)}</span>
            </PriceRow>
          </PriceRows>
        </Section>
      </Page>

      <BottomBar>
        <PrimaryButton
          aria-busy={isLoadingOrder}
          onClick={() => setIsPaymentConfirmed(true)}
        >
          결제하기
        </PrimaryButton>
      </BottomBar>

      {isCouponModalOpen && (
        <Overlay role="presentation">
          <Modal role="dialog" aria-modal="true" aria-label="쿠폰 선택">
            <ModalHeader>
              <ModalTitle>쿠폰을 선택해 주세요</ModalTitle>
              <CloseButton
                type="button"
                aria-label="쿠폰 선택 닫기"
                onClick={() => setIsCouponModalOpen(false)}
              >
                ×
              </CloseButton>
            </ModalHeader>
            <CouponGuide>
              ⓘ 쿠폰은 최대 {MAX_COUPON_COUNT}개까지 사용할 수 있습니다.
            </CouponGuide>

            {isLoadingCoupons ? (
              <InfoText>쿠폰을 불러오는 중입니다.</InfoText>
            ) : (
              <CouponList>
                {coupons.map((coupon) => {
                  const isChecked = draftCouponCodes.includes(
                    coupon.coupon.code,
                  );
                  return (
                    <CouponItem
                      key={coupon.coupon.code}
                      $disabled={!coupon.isAvailable}
                    >
                      <CheckLabel>
                        <Checkbox
                          type="checkbox"
                          checked={isChecked}
                          disabled={!coupon.isAvailable}
                          onChange={() => toggleCoupon(coupon)}
                        />
                        <CouponName>
                          {coupon.coupon.description}
                        </CouponName>
                      </CheckLabel>
                      <CouponMeta>
                        만료일: {coupon.coupon.expirationDate}
                        <br />
                        {formatCouponDetail(coupon)}
                        <br />
                        {coupon.isAvailable
                          ? `예상 할인: ${formatWon(coupon.expectedDiscountAmount)}`
                          : coupon.unavailableReason}
                      </CouponMeta>
                    </CouponItem>
                  );
                })}
              </CouponList>
            )}

            <ModalApplyButton
              disabled={isLoadingCoupons}
              onClick={applyCoupons}
            >
              총 {formatWon(selectedCouponDiscount)} 할인 쿠폰 사용하기
            </ModalApplyButton>
          </Modal>
        </Overlay>
      )}
    </>
  );
};
