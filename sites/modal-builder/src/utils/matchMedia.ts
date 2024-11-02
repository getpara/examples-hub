export const createCustomMatchMedia = (mobileWidth: number) => {
  const originalMatchMedia = window.matchMedia;

  return (query: string) => {
    const match = query.match(/(min|max)-width:\s*(\d+)px/);

    if (match) {
      const [, type, valueStr] = match;
      const value = parseInt(valueStr, 10);

      let matches = false;

      if (type === 'max') {
        matches = value >= mobileWidth;
      } else if (type === 'min') {
        matches = value <= mobileWidth;
      }

      return {
        matches,
        addListener: () => {},
        removeListener: () => {},
      } as any;
    }

    return originalMatchMedia(query);
  };
};
