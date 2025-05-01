import { ChartConfig, ChartTooltip } from '@getpara/react-component-library';
import { useState } from 'react';
import { Bar, BarChart as RechartsBar, CartesianGrid, Cell, Rectangle, XAxis, YAxis } from 'recharts';
import { CategoricalChartState } from 'recharts/types/chart/types';
import { BarChartTooltip } from './BarChartTooltip';
import { truncateNumber } from '../../../../../utils/formatNumber';
import { ChartContainer } from './ChartContainer';

type DataType<XKey extends string, XValue, YKey extends string, YValue> = {
  [K in XKey]: XValue;
} & {
  [K in YKey]: YValue;
};

type BarChartProps<XKey extends string, XValue, YKey extends string, YValue> = {
  title: string;
  id: string;
  data: DataType<XKey, XValue, YKey, YValue>[] | undefined;
  xAxisKey: XKey;
  yAxisKey: YKey;
  chartConfig: ChartConfig;
  xTickFormatter?: (_: XValue) => string | number;
  isLoading?: boolean;
};

export const BarChart = <XKey extends string, XValue, YKey extends string, YValue>({
  title,
  id,
  data,
  xAxisKey,
  yAxisKey,
  chartConfig,
  xTickFormatter,
  isLoading,
}: BarChartProps<XKey, XValue, YKey, YValue>) => {
  const [tooltipPosition, setTooltipPosition] = useState<null | { x: number; y: number }>({ x: 0, y: 0 });

  const onMouseMove = (chartState: CategoricalChartState) => {
    if (chartState.isTooltipActive && chartState.activePayload?.[0] !== undefined) {
      const el = document.getElementsByName(`${id}-${chartState.activeTooltipIndex}`)?.[0];
      const chartEl = document.getElementById(`${id}-chart`);
      const x = chartState.activeCoordinate?.x;
      const y = el ? parseFloat(el.getAttribute('y') as string) : (chartEl?.clientHeight ?? 0) - 40;
      if (x != null && y != null) {
        setTooltipPosition({ x, y: y }); // 10px above bar
      }
    } else {
      setTooltipPosition(null);
    }
  };

  const onMouseLeave = () => {
    setTooltipPosition(null);
  };

  return (
    <ChartContainer noData={!data} isLoading={isLoading} title={title} chartConfig={chartConfig} fullWidth>
      <RechartsBar
        id={`${id}-chart`}
        accessibilityLayer
        data={data}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
      >
        <CartesianGrid vertical={false} stroke="var(--para-color-shadowstone-100)" />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={value => xTickFormatter?.(value) ?? value}
          tick={{ stroke: 'var(--para-color-muted-foreground)', fontSize: 12, strokeWidth: 0.7, fontFamily: 'Inter' }}
          padding={{ left: 28, right: 0 }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickCount={5}
          tick={({ x, y, payload, index }) => {
            if (index === 4) {
              return null as any;
            }

            const formattedValue = typeof payload.value === 'number' ? truncateNumber(payload.value) : payload.value;

            return (
              <text
                x={x}
                y={y - 8}
                textAnchor="middle"
                fontSize={12}
                stroke="var(--para-color-muted-foreground)"
                strokeWidth={0.7}
                fontFamily="Inter"
              >
                {formattedValue}
              </text>
            );
          }}
          tickMargin={8}
          tickLine={false}
          mirror
        />
        <ChartTooltip
          content={props => (
            <BarChartTooltip id={id} active={props.active} payload={props.payload} position={tooltipPosition} />
          )}
          cursor={false}
        />
        <defs>
          <linearGradient id="activeFill" x1="0" y1="100%" x2="0" y2="0">
            <stop offset="0" stopColor="var(--para-color-sundrop-500)" />
            <stop offset="1" stopColor="var(--para-color-magnetica-600)" />
          </linearGradient>
        </defs>
        <Bar
          id={id}
          dataKey={yAxisKey}
          fill="var(--para-color-mist-100)"
          opacity={0.5}
          radius={8}
          activeBar={<Rectangle fill={`url(#activeFill)`} opacity={1} />}
        >
          {data?.map((_, index) => <Cell key={`${id}-${index}`} name={`${id}-${index}`} />)}
        </Bar>
      </RechartsBar>
    </ChartContainer>
  );
};
