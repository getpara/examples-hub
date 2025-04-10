import styled from 'styled-components';
import { ReactNode } from 'react';
import { LINEAR_GRADIENT } from '../common';
import { Card, CardContent } from '@getpara/react-component-library';
import clsx from 'clsx';

interface SplitCardProps {
  LeftContent?: ReactNode;
  RightContent?: ReactNode;
  isSelected?: boolean;
  flexRow?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
}

export const SplitCard = ({ LeftContent, RightContent, isSelected, highlighted, onClick }: SplitCardProps) => {
  const Content = (
    <Card
      className={clsx('para:shadow-none para:rounded-2xl para:border-border para:max-w-[1200px] para:w-full', {
        'para:hover:bg-muted para:cursor-pointer': !!onClick,
        'para:border-foreground': isSelected,
      })}
      onClick={onClick}
    >
      <CardContent className={'para:flex para:flex-col para:gap-4 para:md:flex-row para:md:gap-6'}>
        {LeftContent}
        {RightContent}
      </CardContent>
    </Card>
  );

  return highlighted ? (
    <div
      className="para:w-full para:h-full para:p-[1px] para:rounded-2xl para:shadow-[0px_4px_20px_0px_rgba(156,30,255,0.1)]"
      style={{ background: LINEAR_GRADIENT }}
    >
      {Content}
    </div>
  ) : (
    Content
  );
};

export const SplitCardInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;
