export const truncateApiKey = (key: string) => `${key.slice(0, 6)}...${key.slice(key.length - 4, key.length)}`;
