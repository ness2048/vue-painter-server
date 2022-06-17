import { BrushPoint } from "./brush-point";
import { ExpressionStyleBase } from "./expression-style-base";

export class SpeedExpressionStyle implements ExpressionStyleBase {
  public isReverse = false;

  public minimumSpeed = 0;

  public maximumSpeed = 0;

  public apply(p: BrushPoint, value: number): number {
    if (this.minimumSpeed === this.maximumSpeed) {
      return value;
    }

    const speed = SpeedExpressionStyle.clamp(p.speed, this.minimumSpeed, this.maximumSpeed);
    let ratio = (speed - this.minimumSpeed) / (this.maximumSpeed - this.minimumSpeed);
    if (this.isReverse) {
      ratio = 1 / ratio;
    }
    return value * ratio;
  }

  private static clamp(x: number, min: number, max: number): number {
    if (x < min) {
      return min;
    }
    if (x > max) {
      return max;
    }
    return x;
  }
}
