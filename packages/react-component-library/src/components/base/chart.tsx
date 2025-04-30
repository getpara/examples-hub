'use client';

import * as React from 'react';
import * as RechartsPrimitive from 'recharts';

import { cn } from '@/lib/utils';

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const;

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> });
};

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />');
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig;
  children: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>['children'];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "para:[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground para:[&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 para:[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border para:[&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border para:[&_.recharts-radial-bar-background-sector]:fill-muted para:[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted para:[&_.recharts-reference-line_[stroke='#ccc']]:stroke-border para:flex para:aspect-video para:justify-center para:text-xs para:[&_.recharts-dot[stroke='#fff']]:stroke-transparent para:[&_.recharts-layer]:outline-hidden para:[&_.recharts-sector]:outline-hidden para:[&_.recharts-sector[stroke='#fff']]:stroke-transparent para:[&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>{children}</RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(([, config]) => config.theme || config.color);

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color = itemConfig.theme?.[theme as keyof typeof itemConfig.theme] || itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  );
};

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<'div'> & {
    hideLabel?: boolean;
    hideIndicator?: boolean;
    indicator?: 'line' | 'dot' | 'dashed';
    nameKey?: string;
    labelKey?: string;
  }) {
  const { config } = useChart();

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null;
    }

    const [item] = payload;
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`;
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const value =
      !labelKey && typeof label === 'string' ? config[label as keyof typeof config]?.label || label : itemConfig?.label;

    if (labelFormatter) {
      return <div className={cn('para:font-medium', labelClassName)}>{labelFormatter(value, payload)}</div>;
    }

    if (!value) {
      return null;
    }

    return <div className={cn('para:font-medium', labelClassName)}>{value}</div>;
  }, [label, labelFormatter, payload, hideLabel, labelClassName, config, labelKey]);

  if (!active || !payload?.length) {
    return null;
  }

  const nestLabel = payload.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'para:border-border/50 para:bg-background para:grid para:min-w-[8rem] para:items-start para:gap-1.5 para:rounded-lg para:border para:px-2.5 para:py-1.5 para:text-xs para:shadow-xl',
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="para:grid para:gap-1.5">
        {payload.map((item, index) => {
          const key = `${nameKey || item.name || item.dataKey || 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const indicatorColor = color || item.payload.fill || item.color;

          return (
            <div
              key={item.dataKey}
              className={cn(
                'para:[&>svg]:text-muted-foreground para:flex para:w-full para:flex-wrap para:items-stretch para:gap-2 para:[&>svg]:h-2.5 para:[&>svg]:w-2.5',
                indicator === 'dot' && 'para:items-center',
              )}
            >
              {formatter && item?.value !== undefined && item.name ? (
                formatter(item.value, item.name, item, index, item.payload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn('para:shrink-0 para:rounded-[2px] para:border-(--color-border) para:bg-(--color-bg)', {
                          'para:h-2.5 para:w-2.5': indicator === 'dot',
                          'para:w-1': indicator === 'line',
                          'para:w-0 para:border-[1.5px] para:border-dashed para:bg-transparent': indicator === 'dashed',
                          'para:my-0.5': nestLabel && indicator === 'dashed',
                        })}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      'para:flex para:flex-1 para:justify-between para:leading-none para:gap-1',
                      nestLabel ? 'para:items-end' : 'para:items-center',
                    )}
                  >
                    <div className="para:grid para:gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="para:text-muted-foreground">{itemConfig?.label || item.name}</span>
                    </div>
                    {item.value && (
                      <span className="para:text-foreground para:font-mono para:font-medium para:tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: React.ComponentProps<'div'> &
  Pick<RechartsPrimitive.LegendProps, 'payload' | 'verticalAlign'> & {
    hideIcon?: boolean;
    nameKey?: string;
  }) {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'para:flex para:items-center para:justify-center para:gap-4',
        verticalAlign === 'top' ? 'para:pb-3' : 'para:pt-3',
        className,
      )}
    >
      {payload.map(item => {
        const key = `${nameKey || item.dataKey || 'value'}`;
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value}
            className={cn(
              'para:[&>svg]:text-muted-foreground para:flex para:items-center para:gap-1.5 para:[&>svg]:h-3 para:[&>svg]:w-3',
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="para:h-2 para:w-2 para:shrink-0 para:rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(config: ChartConfig, payload: unknown, key: string) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined;
  }

  const payloadPayload =
    'payload' in payload && typeof payload.payload === 'object' && payload.payload !== null ? payload.payload : undefined;

  let configLabelKey: string = key;

  if (key in payload && typeof payload[key as keyof typeof payload] === 'string') {
    configLabelKey = payload[key as keyof typeof payload] as string;
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[key as keyof typeof payloadPayload] as string;
  }

  return configLabelKey in config ? config[configLabelKey] : config[key as keyof typeof config];
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle };
