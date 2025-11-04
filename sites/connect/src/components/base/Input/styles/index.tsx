import styled from 'styled-components';

interface CustomInputProps {
  width: number;
}

export const CustomInput = styled.input<CustomInputProps>`
  flex: 1;
  width: ${({ width }) => `${width}px`};
  height: 48px;
  border-radius: 12px;
  padding: 14px 12px 14px 12px;
  gap: 10px;
  box-shadow: 0px 1px 1px 0px #1212121a;
  font-family: Inter;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
  color: #000000;
  outline: none;
  border: none;

  &::placeholder {
    color: #999999;
  }

  @media (max-width: 768px) {
    width: 310px;
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  flex: 1;
  height: 48px;
  position: relative;
  border-radius: 12px;
  padding: 14px 12px 14px 12px;
  gap: 10px;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0px 1px 1px 0px #1212121a;
  font-family: Inter;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 3px;
  text-align: left;
  color: #000000;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    width: 256px;
  }
`;

export const Copybutton = styled.button`
  z-index: 1000;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  box-shadow: 0px 1px 1px 0px rgba(18, 18, 18, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  outline: none;
  cursor: pointer;
`;

export const AddressText = styled.span`
  font-family: Inter;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 3px;
  text-align: left;
  color: #000000;
  overflow: auto;
  flex: 1;
`;

export const VisibilityContainer = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;
