import { formatDateInUTC } from './formatDate';

export const formatTSData = <T>(
  data: ({
    date: number;
  } & T)[],
) =>
  data.map(d => ({
    ...d,
    date: formatDateInUTC(new Date(d.date)).valueOf(),
  }));

export const formatPercentTotalData = <T>(
  data: ({
    percent: number;
  } & T)[],
) =>
  data
    .map(d => ({
      ...d,
      percent: Math.round(d.percent * 100),
    }))
    .sort((a, b) => b.percent - a.percent);
