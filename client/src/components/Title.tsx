import styled from "styled-components";

const TitleWrapper = styled.div`
  padding: 24px 20px 8px;
`;

const H1 = styled.h1`
  font-size: 24px;
  font-weight: bold;
`;

export const Title = () => {
  return (
    <TitleWrapper>
      <H1>장바구니</H1>
    </TitleWrapper>
  );
};
