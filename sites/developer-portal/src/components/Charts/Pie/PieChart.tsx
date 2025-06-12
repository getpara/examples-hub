import { ChartConfig, ChartTooltip, ChartTooltipContent, Typography } from '@getpara/react-component-library';
import { PieChart as RechartsPieChart, Pie, Label } from 'recharts';
import { ChartContainer } from '../ChartContainer';

type DataType<DataKey extends string, DataValue, NameKey extends string, NameValue> = {
  [K in DataKey]: DataValue;
} & {
  [K in NameKey]: NameValue;
};

type BarChartProps<DataKey extends string, DataValue, NameKey extends string, NameValue> = {
  title: string;
  data: DataType<DataKey, DataValue, NameKey, NameValue>[] | undefined;
  dataKey: DataKey;
  nameKey: NameKey;
  chartConfig: ChartConfig;
  centerData: string;
  label: string;
  isLoading?: boolean;
};

export const PieChart = <DataKey extends string, DataValue, NameKey extends string, NameValue>({
  title,
  data,
  dataKey,
  nameKey,
  chartConfig,
  centerData,
  label,
  isLoading,
}: BarChartProps<DataKey, DataValue, NameKey, NameValue>) => {
  return (
    <ChartContainer
      isLoading={isLoading}
      noData={!data}
      title={title}
      chartConfig={chartConfig}
      RightContent={
        <div className="para:flex para:flex-wrap para:gap-x-4 para:gap-y-2">
          {data?.map(d => {
            const val = d[dataKey];

            if (!val) {
              return null;
            }

            const formattedVal = typeof val === 'number' ? val.toLocaleString() : val;

            return (
              <div key={chartConfig[d[nameKey]].label?.toString()} className="para:flex para:gap-2 para:items-center">
                <div
                  className="para:py-1.5 para:px-3 para:rounded-md para:w-[57px]"
                  style={{ backgroundColor: chartConfig[d[nameKey]].color }}
                >
                  <Typography className="para:text-xs para:text-primary-foreground para:text-center">
                    {formattedVal as string}
                  </Typography>
                </div>
                <Typography color="muted" className="para:text-xs para:font-medium">
                  {chartConfig[d[nameKey]].label}
                </Typography>
              </div>
            );
          })}
        </div>
      }
    >
      <RechartsPieChart margin={{ top: 0, bottom: 0, left: 0, right: 0 }}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={'65%'}
          minAngle={5}
          outerRadius={'100%'}
          paddingAngle={1}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="para:fill-foreground para:text-3xl para:font-bold">
                      {centerData}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="para:fill-muted-foreground">
                      {label}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
};
