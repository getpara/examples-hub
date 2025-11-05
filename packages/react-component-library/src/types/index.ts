import { ComponentProps, ComponentType } from 'react';

export type ComponentWithClassNames<T extends ComponentType, C> = ComponentProps<T> & {
  classNames?: {
    [key in keyof C]?: C[key];
  };
};
