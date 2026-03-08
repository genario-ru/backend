import { omit } from "es-toolkit";

type FieldsWithUndefined<T extends object> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

type FieldsWithoutUndefined<T extends object> = Exclude<
  keyof T,
  FieldsWithUndefined<T>
>;

export type RemoveUndefinedFields<T extends object> = {
  [K in FieldsWithoutUndefined<T>]: T[K];
} & {
  [K in FieldsWithUndefined<T>]?: Exclude<T[K], undefined>;
};

export function removeUndefinedFields<T extends object>(obj: T) {
  const undefinedKeys = Object.keys(obj).filter(
    (key) => obj[key as keyof T] === undefined,
  ) as Array<keyof T>;

  return omit(obj, undefinedKeys) as RemoveUndefinedFields<T>;
}
