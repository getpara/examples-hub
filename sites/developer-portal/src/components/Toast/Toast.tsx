import { CpslButton, CpslIcon, CpslText } from '@getpara/react-components';
import styled from 'styled-components';

type Variant = 'success' | 'error' | 'warning';

export interface ToastProps {
  variant: Variant;
  title: string;
  body?: string;
  onClose: () => void;
}

export const Toast = ({ variant, title, body, onClose }: ToastProps) => {
  return (
    <Container>
      <Icon icon="checkCircle" $variant={variant} />
      <InnerContainer>
        <Title variant="bodyL" weight="semiBold" $variant={variant}>
          {title}
        </Title>
        {body && <CpslText variant="bodyS">{body}</CpslText>}
      </InnerContainer>
      <CpslButton variant="ghost" onClick={onClose}>
        <CpslIcon icon="close" />
      </CpslButton>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 8px;
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const Icon = styled(CpslIcon)<{ $variant: Variant }>`
  --icon-color: ${({ $variant }) =>
    $variant === 'success'
      ? 'var(--cpsl-color-utility-green)'
      : $variant === 'error'
        ? 'var(--cpsl-color-utility-red)'
        : 'var(--cpsl-color-utility-yellow)'};
`;

const Title = styled(CpslText)<{ $variant: Variant }>`
  &::part(text-element) {
    color: ${({ $variant }) =>
      $variant === 'success'
        ? 'var(--cpsl-color-utility-green)'
        : $variant === 'error'
          ? 'var(--cpsl-color-utility-red)'
          : 'var(--cpsl-color-utility-yellow)'};
  }
`;
