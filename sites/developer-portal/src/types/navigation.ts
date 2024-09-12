import { IconType } from '@usecapsule/core-components';

export type NavRoute = {
  path: string;
  label: string;
  icon: IconType;
  comingSoon?: boolean;
  exactMainRouteMatch?: boolean;
  subRoutes?: {
    value: string;
    label: string;
  }[];
};
