export const pluralize = (count: number, word: string, suffix = 's') => (count === 1 ? word : `${word}${suffix}`);
