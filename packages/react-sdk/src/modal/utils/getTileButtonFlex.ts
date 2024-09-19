export const getTileButtonFlex = (index: number, totalItems: number) => {
  const gapOffset = 8 - 8 * 0.333;

  if (totalItems < 2) {
    return '1 1 auto';
  }

  if (totalItems % 3 === 0) {
    return `0 0 calc(33.333333% - ${gapOffset}px)`;
  }

  if (totalItems % 3 === 1) {
    return index < 4 ? '0 0 calc(50% - 4px)' : `0 0 calc(33.333333% - ${gapOffset}px)`;
  }

  if (totalItems % 3 === 2) {
    return index < 2 ? '0 0 calc(50% - 4px)' : `0 0 calc(33.333333% - ${gapOffset}px)`;
  }
};
