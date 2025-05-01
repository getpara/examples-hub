export const getPercentChange = (current: number, previous: number, decimals: number = 1) => {
  const percentChange = previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100;

  return parseFloat(percentChange.toFixed(decimals));
};
