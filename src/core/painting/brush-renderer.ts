import { Brush } from "./brush";
import { BrushPoint } from "./brush-point";
import { PaintUtility } from "./paint-utility";
import { SpeedExpressionStyle } from "./speed-expression-style";

/**
 * ブラシを使用してレンダリング ターゲットにストロークを描画します。
 */
export class BrushRenderer {
  private context!: CanvasRenderingContext2D;

  private lastRenderedPoint?: BrushPoint;

  private brushValue: Brush = new Brush();

  private renderedPoints: BrushPoint[] = [];

  constructor(context: CanvasRenderingContext2D) {
    this.context = context;
  }

  /**
   * ブラシを取得または設定します。
   */
  public get brush(): Brush {
    return this.brushValue;
  }

  public set brush(value: Brush) {
    this.brushValue = value;
    const expStyle = new SpeedExpressionStyle();
    expStyle.maximumSpeed = 10;
    expStyle.minimumSpeed = 0;
    this.brushValue.expressionStyle = expStyle;
    this.brushValue.sizeParameters.minimumSizeRatio = 0.1;
    this.brushValue.sizeParameters.size = 12;
    this.brushValue.color = "black";
  }

  /**
   * 点を描画します。
   * @param p 描画する位置。
   */
  public drawPoint(p: BrushPoint) {
    console.log("drawPoint");
    this.clearRenderdPoints();
    PaintUtility.drawPoint(this.context, this.brushValue, p);
    this.addRenderdPoint(p);
  }

  /**
   * 2点間に線を描画します。
   * brush.distance で指定された間隔ごとに点を描画して線を表現します。
   * そのため、最後に描画される点の位置が p2 で指定された位置とずれることがあります。
   * @param p1 開始点。
   * @param p2 終了点。
   * @param isRenderStartPoint 開始位置の点を描画するかどうか。
   */
  public drawLine(p1: BrushPoint, p2: BrushPoint, isRenderStartPoint: boolean) {
    this.clearRenderdPoints();
    const lastPoint = PaintUtility.drawLine(
      this.context,
      this.brushValue,
      p1,
      p2,
      isRenderStartPoint
    );
    if (lastPoint) {
      this.addRenderdPoint(lastPoint);
    }

    return lastPoint;
  }

  /**
   * 前回描画された点から指定された点まで線を描画します。
   * @param p 終了点。
   * @param isRenderStartPoint 開始位置の点を描画するかどうか。
   * @returns 最後に描画された点を返します。
   */
  public drawLineFromLastPoint(p: BrushPoint, isRenderStartPoint: boolean): BrushPoint | undefined {
    const p1 = this.lastRenderedPoint ?? p;

    if (this.lastRenderedPoint) {
      const d = BrushPoint.distance(p1, p);
      if (d <= this.brushValue.distance) {
        // 最後の描画位置からの距離がブラシの間隔より大きい場合、線を描画する。

        return p1;
      }
    }

    const lastPoint = PaintUtility.drawLine(
      this.context,
      this.brushValue,
      p1,
      p,
      isRenderStartPoint
    );
    this.addRenderdPoint(lastPoint);

    return lastPoint;
  }

  /**
   * 描画した点の位置情報を消去します。
   */
  public clearRenderdPoints() {
    this.lastRenderedPoint = undefined;
    this.renderedPoints = [];
  }

  /**
   * 描画した点の位置をリストに追加します。
   * p が undefined の場合はリストに追加されず、最後に描画した位置が undefined に更新されます。
   * @param p
   */
  public addRenderdPoint(p: BrushPoint | undefined) {
    this.lastRenderedPoint = p;
    if (p) {
      this.renderedPoints.push(p);
    }
  }
}
