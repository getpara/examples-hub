import { ZodObject, ZodType } from 'zod';

export type SchemaFromInterface<T> = ZodObject<{
  [K in keyof Partial<T>]: K extends keyof T ? ZodType<T[K]> : never;
}>;
