import { useRouter } from 'next/router';
import * as Styled from './styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

interface BackButtonProps {
  isMobile: boolean;
}

export const BackButton = ({ isMobile }: BackButtonProps) => {
  const router = useRouter();

  return (
    <Styled.BackButton
      secondary
      onClick={() => {
        router.back();
      }}
      isMobile={isMobile}
    >
      <ChevronLeftIcon style={{ width: 20, height: 20 }} />
    </Styled.BackButton>
  );
};
