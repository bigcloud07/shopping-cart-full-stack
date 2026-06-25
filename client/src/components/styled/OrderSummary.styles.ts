import styled from "styled-components";

export const Wrapper = styled.div`
  border-top: 1px solid #eee;
  margin-top: 8px;
`;

export const InfoText = styled.p`
  padding: 14px 20px;
  font-size: 13px;
  color: #555;
`;

export const RowList = styled.div`
  border-top: 1px solid #eee;
`;

export const Row = styled.div<{ $bold?: boolean }>`
  display: flex;
  justify-content: space-between;
  padding: 14px 20px;
  border-top: ${({ $bold }) => ($bold ? "1px solid #eee" : "none")};
`;

export const Label = styled.span`
  font-size: 16px;
  font-weight: 500;
`;

export const Amount = styled.span<{ $large?: boolean }>`
  font-size: ${({ $large }) => ($large ? "18px" : "16px")};
  font-weight: bold;
`;
