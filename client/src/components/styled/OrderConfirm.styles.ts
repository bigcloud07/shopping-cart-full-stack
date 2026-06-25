import styled from "styled-components";

export const Page = styled.div`
  padding: 0 20px 96px;
`;

export const Description = styled.p`
  margin-top: 8px;
  font-size: 13px;
  color: #222;
  line-height: 1.5;
`;

export const Section = styled.section`
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #eee;
`;

export const SectionTitle = styled.h2`
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
`;

export const ItemList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ItemRow = styled.li`
  display: flex;
  gap: 16px;
  list-style: none;
`;

export const ProductImage = styled.img`
  width: 112px;
  height: 112px;
  border-radius: 4px;
  object-fit: cover;
  background: #f4f4f4;
`;

export const ProductInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

export const ProductName = styled.p`
  margin-bottom: 4px;
  overflow-wrap: anywhere;
  font-size: 13px;
  font-weight: 600;
  color: #444;
`;

export const ProductPrice = styled.p`
  margin-bottom: 14px;
  font-size: 22px;
  font-weight: 800;
`;

export const ProductQuantity = styled.p`
  font-size: 13px;
  font-weight: 700;
`;

export const CouponButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 18px;
  border: 1px solid #d8d8d8;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

export const CheckLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`;

export const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #000;
`;

export const InfoText = styled.p`
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  font-size: 12px;
  color: #333;
`;

export const PriceRows = styled.div`
  margin-top: 10px;
`;

export const PriceRow = styled.div<{ $strong?: boolean }>`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 0;
  border-bottom: ${({ $strong }) => ($strong ? "none" : "1px solid #f2f2f2")};
  font-size: ${({ $strong }) => ($strong ? "17px" : "15px")};
  font-weight: ${({ $strong }) => ($strong ? 800 : 700)};
`;

export const NegativeAmount = styled.span`
  color: #000;
`;

export const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  z-index: 20;
  width: 100%;
  max-width: 480px;
  transform: translateX(-50%);
  background: #000;
`;

export const PrimaryButton = styled.button`
  width: 100%;
  padding: 20px;
  border: none;
  background: none;
  color: #fff;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgb(0 0 0 / 35%);
`;

export const Modal = styled.div`
  width: min(100%, 360px);
  max-height: min(620px, calc(100vh - 48px));
  overflow-y: auto;
  border-radius: 8px;
  background: #fff;
  padding: 22px 28px;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

export const ModalTitle = styled.h2`
  font-size: 16px;
  font-weight: 800;
`;

export const CloseButton = styled.button`
  border: none;
  background: none;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
`;

export const CouponGuide = styled.p`
  margin-top: 22px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
`;

export const CouponList = styled.ul`
  display: flex;
  flex-direction: column;
`;

export const CouponItem = styled.li<{ $disabled: boolean }>`
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  list-style: none;
  color: ${({ $disabled }) => ($disabled ? "#bdbdbd" : "#000")};
`;

export const CouponName = styled.span`
  font-size: 14px;
  font-weight: 800;
`;

export const CouponMeta = styled.p`
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
`;

export const ModalApplyButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 20px;
  border: none;
  border-radius: 4px;
  background: #333;
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const CenterMessage = styled.div`
  display: flex;
  min-height: 58vh;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  text-align: center;
`;

export const CompleteTitle = styled.h2`
  font-size: 22px;
  font-weight: 800;
`;

export const CompleteDescription = styled.p`
  margin-top: 28px;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.6;
`;

export const CompleteAmountLabel = styled.p`
  margin-top: 28px;
  font-size: 15px;
  font-weight: 800;
`;

export const CompleteAmount = styled.p`
  margin-top: 8px;
  font-size: 24px;
  font-weight: 900;
`;
