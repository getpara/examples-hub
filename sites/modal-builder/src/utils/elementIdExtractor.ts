import { isValidElement, ReactElement, Children } from 'react';
import { DraggableHeader } from '../components/UI';

export const extractId = <T>(element: ReactElement): T | null => {
  if (!isValidElement(element)) {
    return null;
  }

  const { children } = element.props as { children: React.ReactNode };
  const childrenArray = Children.toArray(children);

  const header = childrenArray.find(child => isValidElement(child) && child.type === DraggableHeader) as
    | ReactElement
    | undefined;

  if (!header) {
    return null;
  }

  const { id } = header.props;

  return id as T;
};
