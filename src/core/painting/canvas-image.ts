import { Color, Vector2 } from "three";
import { ImageInfo } from "./image-info";

type DrawType = {
  (texture: CanvasImageSource, color: string): void;
};

/**
 * キャンバスに描画される画像を表します。
 */
export class CanvasImage {
  private static readonly THUMBNAIL_WIDTH = 256;

  private static readonly THUMBNAIL_HEIGHT = 256;

  // #region プライベート フィールド
  private imageInfo = new ImageInfo();

  private thumbnailDataValue?: ImageData;

  private texturesValue: HTMLCanvasElement[] = [];
  // #endregion プライベート フィールド

  // #region プロパティ
  public get title(): string {
    return this.imageInfo.title;
  }

  public set title(value: string) {
    this.imageInfo.title = value;
  }

  public get author(): string {
    return this.imageInfo.author;
  }

  public set author(value: string) {
    this.imageInfo.author = value;
  }

  public get updateTime(): Date {
    return this.imageInfo.updateTime;
  }

  public get width(): number {
    return this.imageInfo.width;
  }

  public get height(): number {
    return this.imageInfo.height;
  }

  public get selectedLayerIndex() {
    return this.imageInfo.selectedLayerIndex;
  }

  public set selectedLayerIndex(value: number) {
    this.imageInfo.selectedLayerIndex = value;
  }

  public get selectedLayerTexture(): HTMLCanvasElement | undefined {
    if (this.selectedLayerIndex === 0) {
      return undefined;
    }
    return this.textures[this.selectedLayerIndex];
  }

  public get textures(): HTMLCanvasElement[] {
    return this.texturesValue;
  }

  public get thumbnailDate(): ImageData | undefined {
    return this.thumbnailDataValue;
  }

  public get layerOpacities(): number[] {
    return this.imageInfo.layerOpacities;
  }
  // #endregion プロパティ

  // #region 構築/消滅
  constructor(width: number, height: number) {
    this.imageInfo.width = width;
    this.imageInfo.height = height;
    this.imageInfo.layerOpacities = [];

    this.addTexture("white");
    this.addTexture("transparent");

    this.imageInfo.selectedLayerIndex = this.texturesValue.length - 1;
  }
  // #endregion

  // #region 保存
  public async save(path: string): Promise<void> {
    // TODO キャンバスの保存を実装する
  }
  // #endregion 保存

  // #region 読み込み
  public static async load(path: string): Promise<CanvasImage> {
    // TODO キャンバスの読み込みを実装する
    return Promise.reject();
  }
  // #endregion 読み込み

  // #region テクスチャ
  public addTexture(color: string): HTMLCanvasElement {
    return this.insertTexture(color, this.texturesValue.length);
  }

  public insertTexture(color: string, index: number): HTMLCanvasElement {
    // レイヤーのテクスチャを生成する。
    const textureDate = document.createElement("canvas");
    textureDate.width = this.width;
    textureDate.height = this.height;

    // color が透明以外の場合は、指定された色でテクスチャ データを塗りつぶす。
    const ctx = textureDate.getContext("2d");
    if (ctx && color !== "transparent") {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // レイヤーのテクスチャ リストにテクスチャを挿入する。
    this.texturesValue.splice(index, 0, textureDate);

    // レイヤーの不透明度リストに不透明度 1 を追加する。
    this.imageInfo.layerOpacities.push(1);

    return textureDate;
  }
  // #endregion テクスチャ

  public draw(
    context: CanvasRenderingContext2D,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number
  ) {
    this.nativeDrawTextures((texture, color) =>
      context.drawImage(texture, dx, dy, dWidth, dHeight)
    );
  }

  private nativeDrawTextures = (draw: DrawType) => {
    for (let i = 0; i < this.textures.length; i++) {
      const texture = this.textures[i];
      const opacity = this.imageInfo.layerOpacities[i];
      const color = `rgb(${opacity},${opacity},${opacity},${opacity})`;
      draw(texture, color);
    }
  };
  // #endregion 描画
}
