import styled from "styled-components";

const HeaderWrapper = styled.header`
  background: #000;
  color: #fff;
  padding: 16px 20px;
  font-weight: bold;
  font-size: 18px;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
`;

interface HeaderProps {
  onBack?: () => void;
}

export const Header = ({ onBack }: HeaderProps) => {
  return (
    <HeaderWrapper>
      {onBack ? <BackButton onClick={onBack}>← 뒤로가기</BackButton> : "SHOP"}
    </HeaderWrapper>
  );
};
