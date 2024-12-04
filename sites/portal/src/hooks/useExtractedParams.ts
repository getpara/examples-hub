import { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

export function useExtractedParams<T extends Record<string, Array<unknown> | object | string | boolean>>(): T {
  const [searchParams] = useSearchParams();
  const params = useParams();

  return useMemo(
    () =>
      [...searchParams.entries(), ...Object.entries(params)].reduce((acc, [key, encodedValue]) => {
        const value = decodeURIComponent(encodedValue);

        if (['undefined', 'null', undefined, null].includes(value)) {
          return acc;
        }

        if (['true', 'false'].includes(value)) {
          return { ...acc, [key]: value === 'true' };
        }

        try {
          const parsedValue = JSON.parse(value);

          return { ...acc, [key]: typeof parsedValue === 'number' ? parsedValue.toString() : parsedValue };
        } catch (e) {
          return { ...acc, [key]: value.toString() };
        }
      }, {} as T),
    [searchParams, params],
  );
}
