import chroma from "chroma-js";
import { BlendState } from "./blend-state";
import { BrushParameters, BrushParametersImplements } from "./brush-parameters";
import { BrushSizeParameters } from "./brush-size-parameters";
import { ExpressionStyleBase } from "./expression-style-base";
import { NoneExpressionStyle } from "./none-expression-style";
import { PaintUtility } from "./paint-utility";

/**
 * ブラシのパラメーターを表します。
 */
export class Brush {
  private nativeBrushParameters: BrushParameters = new BrushParametersImplements();

  // ブラシのテクスチャ イメージ
  private brushTextureValue?: CanvasImageSource;

  private expressionStyleValue: ExpressionStyleBase = NoneExpressionStyle.Instance;

  private contextColorValue: chroma.Color = chroma("black");

  public get contextColor(): chroma.Color {
    return this.contextColorValue;
  }

  /**
   * ブラシの現在の色を取得または設定します。
   */
  public set contextColor(value: chroma.Color) {
    this.contextColorValue = value;
    const c = this.contextColor;
  }

  /**
   * ブレンディング ステートを取得または設定します。
   */
  // public get blendState2(): BlendState {
  //   return this.nativeBrushParameters.blendState2;
  // }

  // public set blendState2(value: BlendState) {
  //   this.nativeBrushParameters.blendState2 = value;
  // }

  /**
   * ブラシのテクスチャを取得または設定します。
   */

  public get brushTexture(): CanvasImageSource | undefined {
    return this.brushTextureValue;
  }

  public set brushTexture(value: CanvasImageSource | undefined) {
    this.brushTextureValue = value;
  }

  /**
   * ブラシの色を表す RGB 値とα値を取得または設定します。
   */
  public get color(): string {
    return this.nativeBrushParameters.color;
  }

  public set color(value: string) {
    this.nativeBrushParameters.color = value;
  }

  /**
   * ブラシの合成方法を取得します。
   */
  public get compositeOperation(): GlobalCompositeOperation {
    return this.nativeBrushParameters.compositeOperation;
  }

  /**
   * ブラシの合成方法を設定します。
   */
  public set compositeOperation(value: GlobalCompositeOperation) {
    this.nativeBrushParameters.compositeOperation = value;
  }

  /**
   * 点を描画する間隔の比率を取得または設定します。
   * 0.5 を指定すると 50% ずつの間隔で、1 を指定すると 100% ずつの間隔で点が描画されます。
   */
  public get distanceRatio(): number {
    return this.nativeBrushParameters.distanceRatio;
  }

  public set distanceRatio(value: number) {
    this.nativeBrushParameters.distanceRatio = value;
  }

  /**
   * 点を描画する間隔のピクセルサイズを取得します。
   * @returns size * distanceRatio
   */
  public get distance(): number {
    return this.nativeBrushParameters.sizeParameters.size * this.distanceRatio;
  }

  /**
   * ブラシの名前を取得または設定します。
   */
  public get name(): string {
    return this.nativeBrushParameters.name;
  }

  public set name(value: string) {
    this.nativeBrushParameters.name = value;
  }

  /**
   * ブラシの正式名称を取得します。
   */
  public get fullName(): string {
    // TODO 正式名所の取得を実装する
    return "";
  }

  /**
   * ブラシサイズに関するパラメーターを取得します。
   */
  public get sizeParameters(): BrushSizeParameters {
    return this.nativeBrushParameters.sizeParameters;
  }

  /**
   * ブラシパラメーターを取得します。
   */
  public get brushParameters(): BrushParameters {
    return this.nativeBrushParameters;
  }

  public set brushParameters(brushParams: BrushParameters) {
    this.nativeBrushParameters = brushParams;
  }

  /**
   * ブラシの最小サイズを取得または設定します。
   * @returns size * minimumSizeRatio を返します。
   */
  public get minimumSize(): number {
    return (
      this.nativeBrushParameters.sizeParameters.size *
      this.nativeBrushParameters.sizeParameters.minimumSizeRatio
    );
  }

  /**
   * ブラシサイズの表現手法を取得または設定します。
   * @default NoneExpressionStyle
   */
  public get expressionStyle(): ExpressionStyleBase {
    return this.expressionStyleValue;
  }

  public set expressionStyle(value: ExpressionStyleBase) {
    this.expressionStyleValue = value;
  }

  /**
   *
   * @returns ブラシカラーを chroma.Color 型で取得します。
   */
  public stringToColor(): chroma.Color {
    return PaintUtility.stringToColor(this.color);
  }
}
