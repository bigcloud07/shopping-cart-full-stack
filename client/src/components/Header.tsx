import { BackButton, HeaderWrapper } from "./styled/Header.styles";

interface HeaderProps {
  onBack?: () => void;
}

export const Header = ({ onBack }: HeaderProps) => {
  return (
    <HeaderWrapper>
      {onBack ? <BackButton onClick={onBack}>←</BackButton> : "SHOP"}
    </HeaderWrapper>
  );
};
