/**
 * ブラシサイズのパラメーターを表します。
 */
export interface BrushSizeParameters {
  /**
   * ブラシのデフォルトのピクセルサイズを設定または取得します。
   * @default 10
   */
  size: number;

  /**
   * ブラシの最小サイズの比率を設定または取得します。
   * @default 1.0
   */
  minimumSizeRatio: number;

  /**
   * ブラシサイズを表現するスタイル名を取得または設定します。
   */
  expressionStyle: string | undefined;
}

export class BrushSizeParametersImplements implements BrushSizeParameters {
  size = 10;
  minimumSizeRatio = 0.1;
  expressionStyle: string | undefined;
}
