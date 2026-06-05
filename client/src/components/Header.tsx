interface HeaderProps {
  onBack?: () => void;
}

export const Header = ({ onBack }: HeaderProps) => {
  return <div>{onBack ? <button onClick={onBack}>← 뒤로가기</button> : "SHOP"}</div>;
};
