import { useState } from "react";
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
import type { CartItem } from "../type/type";
import { formatCouponDetail } from "../utils/orderSummary";
import { MAX_COUPON_COUNT, useOrderConfirm } from "../hooks/useOrderConfirm";

const formatWon = (amount: number) => `${amount.toLocaleString()}원`;

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
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);
  const {
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
  } = useOrderConfirm(items);

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
              <NegativeAmount>-{formatWon(totalDiscountAmount)}</NegativeAmount>
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
                onClick={closeCouponModal}
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
                        <CouponName>{coupon.coupon.description}</CouponName>
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
