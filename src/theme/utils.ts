import { CSSProperties } from "react";

export function createStyles<C extends string>(
  styles: Record<C, CSSProperties>
): Record<C, CSSProperties> {
  return styles;
}

export type WithStyles<T> = { classes: { [K in keyof T]: string } };
