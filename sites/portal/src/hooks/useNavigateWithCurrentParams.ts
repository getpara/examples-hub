import { useNavigate, useSearchParams } from 'react-router-dom';

export const useNavigateWithCurrentParams = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const navigateWithCurrentParams = (path: string, additionalParams?: Record<string, string | undefined | null>) => {
    const params = new URLSearchParams(searchParams);

    if (additionalParams) {
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
    }

    const paramString = params.toString();
    navigate(`${path}${paramString ? `?${paramString}` : ''}`);
  };

  return navigateWithCurrentParams;
};
