export type Compute<type> = { [key in keyof type]: type[key] } & unknown;

/** Strict version of built-in Omit type */
export type StrictOmit<type, keys extends keyof type> = Pick<type, Exclude<keyof type, keys>>;

export type UnionStrictOmit<type, keys extends keyof type> = type extends any ? StrictOmit<type, keys> : never;

export type ChangeFields<T, R> = Omit<T, keyof R> & R;
