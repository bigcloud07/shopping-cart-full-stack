import styled from "styled-components";
import type { ReactNode } from "react";

const TitleWrapper = styled.div`
  padding: 24px 20px 8px;
`;

const H1 = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

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
