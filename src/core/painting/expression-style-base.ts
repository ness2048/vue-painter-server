import { BrushPoint } from "./brush-point";

export interface ExpressionStyleBase {
  isReverse: boolean;
  apply(p: BrushPoint, v: number): number;
}
