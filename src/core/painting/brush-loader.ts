import { Brush } from "./brush";

/**
 * ブラシを読み込みます。
 */
export class BrushLoader {
  private static readonly BRUSH_FILES_LOCATION = "Sysdev.SmartTouchPainter.Painting.Brushes.";

  private static readonly BRUSH_FILE_EXT = ".xml";

  private static readonly BRUSH_TEXTURE_EXT = ".png";

  /**
   * すべてのブラシ名のリストを取得します。
   * @returns ブラシ名のリスト。
   */
  public getAllBrushNames(): string[] {
    // TODO getAllBrushNames を実装すること。
    return [];
  }

  /**
   * すべてのブラシを取得します。
   * @returns ブラシのリスト。
   * @todo 実装中。
   */
  public getAllBrushes(): Brush[] {
    // TODO 実装すること。
    return [];
  }

  /**
   * ブラシを取得します。
   * @param brushName ブラシ名。
   * @returns ブラシ。
   */
  public getBrush(brushName: string): Brush | undefined {
    // TODO 実装すること。
    return undefined;
  }

  /**
   * ブラシのテクスチャを取得します。
   * @param brushName ブラシ名。
   * @returns テクスチャ。
   */
  public getBrushTexture(brushName: string): CanvasImageSource | undefined {
    // TODO 実装すること。
    return undefined;
  }

  /**
   * ブラシの画像を取得します。
   * @param stringbrushName ブラシ名。
   * @returns 画像。
   */
  public getBrushImage(stringbrushName: string): CanvasImageSource | undefined {
    // TODO 実装すること。
    return undefined;
  }
}
