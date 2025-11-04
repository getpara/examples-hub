import styled from 'styled-components';

export const SecretContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  max-width: 496px;
`;

export const Label = styled.p`
  margin: 0;
  padding: 0;
  color: #000;
  font-family: Inter;
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
`;

export const HiddenInput = styled.input`
  height: 0px;
  width: 0px;
  visibility: hidden;
`;
