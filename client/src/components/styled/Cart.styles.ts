import styled from "styled-components";

export const CenterBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  font-size: 16px;
  color: #555;
`;

export const Spacer = styled.div`
  height: 80px;
`;

export const BottomBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 480px;
  background: #000;
`;

export const OrderButton = styled.button<{ $disabled: boolean }>`
  width: 100%;
  padding: 20px;
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
`;
