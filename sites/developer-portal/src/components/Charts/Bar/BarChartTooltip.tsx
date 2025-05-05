import { Typography } from '@getpara/react-component-library';

type BarChartTooltipProps = {
  id: string;
  active?: boolean;
  payload?: { value?: any }[];
  position?: { x: number; y: number } | null;
};

export const BarChartTooltip = ({ active, payload, position }: BarChartTooltipProps) => {
  if (!active || !payload || !payload.length || !position) return null;

  const el = document.getElementById('mauBar');
  const width = (el?.getAttribute('width') as any) ?? 0;

  const formattedValue = typeof payload[0].value === 'number' ? payload[0].value.toLocaleString() : payload[0].value;

  return (
    <div
      style={{
        transform: 'translate(-50%, -100%)',
        left: position.x,
        top: position.y - 8,
        width: width ? `${width}px` : 'auto',
      }}
      className="para:bg-foreground para:h-7 para:flex para:items-center para:justify-center para:rounded-md para:absolute para:px-3"
    >
      <Typography className="para:text-primary-foreground para:text-xs">{formattedValue}</Typography>
    </div>
  );
};
