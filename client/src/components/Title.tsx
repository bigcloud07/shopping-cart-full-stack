import type { ReactNode } from "react";
import { H1, TitleWrapper } from "./styled/Title.styles";

interface TitleProps {
  children?: ReactNode;
}

export const Title = ({ children = "장바구니" }: TitleProps) => {
  return (
    <TitleWrapper>
      <H1>{children}</H1>
    </TitleWrapper>
  );
};
