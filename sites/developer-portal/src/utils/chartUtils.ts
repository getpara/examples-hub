export const getMaxDomain = (maxValue: number) => {
  const baseLog = Math.floor(Math.log(maxValue) / Math.log(10));

  return maxValue + Math.pow(10, baseLog);
};
