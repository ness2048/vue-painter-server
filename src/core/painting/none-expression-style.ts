import { BrushPoint } from "./brush-point";
import { ExpressionStyleBase } from "./expression-style-base";

export class NoneExpressionStyle implements ExpressionStyleBase {
  public isReverse = false;

  public apply(p: BrushPoint, v: number): number {
    return v;
  }

  public static readonly instance = new NoneExpressionStyle();

  public static get Instance(): NoneExpressionStyle {
    return this.instance;
  }
}
