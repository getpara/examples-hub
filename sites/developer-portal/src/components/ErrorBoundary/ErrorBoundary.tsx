import { Link, useLocation, useNavigate, useRouteError } from 'react-router-dom';
import { SUPPORT_URL } from '../../utils/constants';
import { useLogout } from '../../hooks/useLogout';
import { useEffect, useRef } from 'react';
import { captureException } from '@sentry/react';
import { Alert, Button, cn, Typography } from '@getpara/react-component-library';
import { FlatCard } from '../FlatCard';

interface ErrorBoundaryProps {
  containerType: 'authenticated' | 'unauthenticated' | 'fullScreen';
  variant: 'notFound' | 'error';
  errorWithNav?: boolean;
  captureSentryError?: boolean;
  errorMessage?: string;
  onResetError?: () => void;
}

export const ErrorBoundary = ({
  containerType,
  variant,
  errorWithNav,
  captureSentryError,
  errorMessage,
  onResetError,
}: ErrorBoundaryProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout } = useLogout();
  const error = useRouteError() as Error;
  const errorLocation = useRef(pathname);

  useEffect(() => {
    if (pathname !== errorLocation.current) {
      onResetError?.();
    }
  }, [pathname]);

  useEffect(() => {
    if (captureSentryError) {
      captureException(error);
    }
  }, [captureSentryError, error]);

  const isError = variant === 'error';

  const handleRecoverClick = async () => {
    if (!isError || errorWithNav) {
      navigate('/', { replace: true });
      return;
    }

    try {
      await logout();
    } catch (e) {
      localStorage.clear();
      sessionStorage.clear();
      navigate('/', { replace: true });
    }
  };

  return (
    <div
      className={cn(
        'para:flex para:flex-1 para:items-center para:justify-center para:min-h-[var(--appbar-height-mobile)] para:lg:h-[var(--appbar-height)]',
        {
          'para:min-h-screen': containerType === 'fullScreen',
          'para:min-h-[calc(100vh-var(--appbar-height-mobile)-32px)] para:lg:min-h-[calc(100vh-var(--appbar-height)-32px)]':
            containerType === 'authenticated',
          'para:min-h-[calc(100vh-var(--appbar-height-mobile))] para:lg:min-h-[calc(100vh-var(--appbar-height)-24px)]':
            containerType !== 'unauthenticated' && containerType !== 'fullScreen',
        },
      )}
    >
      <div className="para:flex para:flex-col para:items-center para:justify-center para:gap-6">
        <div>
          <Alert
            variant="destructive"
            className="para:py-6 para:px-10 para:bg-destructive/20 para:flex para:justify-center para:items-center"
          >
            <Typography className="para:text-6xl para:font-medium">{isError ? 'Error' : '404'}</Typography>
          </Alert>
        </div>
        <div className="para:flex para:flex-col para:items-center para:justify-center para:gap-2">
          <Typography className="para:text-center para:font-medium para:text-3xl">
            {isError ? 'Something went wrong' : 'Looks like something is missing'}
          </Typography>
          {isError ? (
            <>
              {(errorMessage || error?.message) && (
                <FlatCard className="para:p-4">Error: {errorMessage ?? error.message}</FlatCard>
              )}
            </>
          ) : (
            <>
              <Typography className="para:text-center para:font-medium para:text-xl" color="muted">
                The page you are looking for doesn’t exist or another error occurred.
              </Typography>
            </>
          )}
        </div>
        <div className="para:flex para:flex-col para:items-center para:justify-center para:gap-2">
          <Button variant="neutral" size="lg" onClick={handleRecoverClick}>
            {!isError || errorWithNav ? 'Back To Home' : 'Log Out and Try Again'}
          </Button>
          <Link to={SUPPORT_URL}>
            <Button variant="link" className="para:text-muted-foreground para:text-base">
              Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
