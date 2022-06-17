import { Box2, NumberKeyframeTrack, Vector2 } from "three";
import { Brush } from "./brush";
import { BrushPoint } from "./brush-point";
import { BrushRenderer } from "./brush-renderer";
import { CanvasImage } from "./canvas-image";
import { NativePointerEvent } from "./NativePointerEvent";
import { PaintGestureSample, PaintGestureType } from "./paint-gesture-sample";
import { PaintTouchPanel } from "./paint-touch-panel";

export class PaintCanvas {
  private static readonly ZOOM_FACTOR = 250;

  // #region プライベート フィールド
  private lastRenderedPoint?: BrushPoint;

  private renderer!: BrushRenderer;

  private contextValue!: CanvasRenderingContext2D;

  private strokeQueue: PaintGestureSample[] = [];

  private isClearCanvas = false;

  private previousPinchLength = 0;

  private canvasPositionValue: Vector2 = new Vector2();

  private canvasOriginValue: Vector2 = new Vector2();

  private canvasScaleValue = 1;

  private doubleTapScale = 3;

  private isDraging = false;

  private background?: CanvasImageSource;

  private canvasTargetValue!: CanvasImageSource;

  private canvasImageValue!: CanvasImage;

  private nativePaintTouchPanel: PaintTouchPanel = new PaintTouchPanel();

  private dartyRegion: Box2 = new Box2();
  // #endregion プライベート フィールド

  public get paintTouchPanel(): PaintTouchPanel {
    return this.nativePaintTouchPanel;
  }

  // #region プロパティ
  public get context(): CanvasRenderingContext2D {
    return this.contextValue;
  }

  public set context(value: CanvasRenderingContext2D) {
    this.contextValue = value;
  }

  public get brush(): Brush {
    return this.renderer.brush;
  }

  public set brush(value: Brush) {
    this.renderer.brush = value;
  }

  public get canvasTarget(): CanvasImageSource {
    return this.canvasTargetValue;
  }

  public get canvasImage(): CanvasImage {
    return this.canvasImageValue;
  }

  public get canvasOrigin(): Vector2 {
    return this.canvasOriginValue;
  }

  public set canvasOrigin(value: Vector2) {
    this.canvasOriginValue = value;
  }

  public get canvasPosition(): Vector2 {
    return this.canvasPositionValue;
  }

  public set canvasPosition(value: Vector2) {
    this.canvasPositionValue = value;
  }

  public get canvasScale(): number {
    return this.canvasScaleValue;
  }

  public set canvasScale(value: number) {
    this.canvasScaleValue = value;
  }

  public get strokeTarget(): CanvasImageSource {
    return this.canvasImage.textures[this.canvasImage.selectedLayerIndex];
  }
  // #endregion

  // #region 構築/消滅
  constructor(context: CanvasRenderingContext2D, canvasImage: CanvasImage) {
    this.initialize(context, canvasImage);
  }

  private initialize(context: CanvasRenderingContext2D, canvasImage: CanvasImage) {
    this.contextValue = context;
    this.renderer = new BrushRenderer(context);
    this.isClearCanvas = true;
    this.renderer.brush = new Brush();
    // this.background = this.loadBackground(context);
    // this.canvasTargetValue = context.creat
    this.canvasImageValue = canvasImage;
  }
  // #endregion 構築/消滅

  // #region 描画
  /**
   * ストローク キューに追加された点を描画します。
   * 呼出し後にキューは消去されます。
   */
  public draw() {
    // ストロークを描画する。
    this.drawStroke();

    // ストロークのキューを消去する。
    this.strokeQueue.splice(0);

    // this.canvasImage.draw(
    //   this.context,
    //   this.canvasPosition.x,
    //   this.canvasPosition.y,
    //   this.canvasImage.width,
    //   this.canvasImage.height
    // );
  }

  /**
   * ポイントを追加してストロークを更新します。
   * @param pe ポインター イベント。
   * @returns
   */
  public update(pe: NativePointerEvent): boolean {
    this.paintTouchPanel.update(pe);

    let ret = false;

    // すべてのジェスチャーを読み込む。
    while (this.paintTouchPanel.isGestureAvailable) {
      const gs = this.paintTouchPanel.readGesture();
      if (!gs) {
        break;
      }
      if (gs.gestureType === PaintGestureType.Pinch) {
        // キャンバスの中心点を計算する。
        const gp = gs.position.add(gs.position2).divideScalar(2);
        this.canvasOriginValue = this.canvasOriginValue.add(
          gp.sub(this.canvasPositionValue).divideScalar(this.canvasScaleValue)
        );

        // キャンバスの描画位置を計算する。
        const pd = gs.delta.add(gs.delta2).divideScalar(2);
        this.canvasPositionValue = gp.add(pd);

        // キャンバスのスケールを計算する。
        const l = gs.position.sub(gs.position2).length();
        if (this.previousPinchLength > 0) {
          const ld = l - this.previousPinchLength;
          this.canvasScaleValue += (ld / PaintCanvas.ZOOM_FACTOR) * this.canvasScaleValue;
        }
        this.previousPinchLength = l;
      } else if (gs.gestureType === PaintGestureType.PinchComplete) {
        this.previousPinchLength = 0;
        this.doubleTapScale = this.canvasScaleValue;
      } else if (gs.gestureType === PaintGestureType.DoubleTap) {
        if (this.canvasScaleValue === 1) {
          const targetWidth = this.canvasTargetValue.width as number;
          const targetHeight = this.canvasTargetValue.height as number;
          // 原寸大の時にダブルタップした場合は _doubleTapscale で表示する。
          this.canvasScaleValue = this.doubleTapScale;
          this.canvasPositionValue = new Vector2(targetWidth / 2, targetHeight / 2);
          this.canvasOriginValue = gs.position;
        } else {
          // それ以外の時にダブルタップした場合は 100% で表示する。
          this.canvasScaleValue = 1;
          this.canvasPositionValue = new Vector2();
          this.canvasOriginValue = new Vector2();
        }
      } else if (gs.gestureType === PaintGestureType.Hold) {
        this.onHold(gs);
      } else if (gs.gestureType === PaintGestureType.HoldMove) {
        this.onHoldMove(gs);
      } else if (gs.gestureType === PaintGestureType.HoldComplete) {
        this.onHoldComplete();
      } else if (gs.gestureType === PaintGestureType.FreeDrag) {
        this.updateStroke(gs);
      } else if (gs.gestureType === PaintGestureType.DragComplete) {
        this.updateStroke(gs);
      } else if (gs.gestureType === PaintGestureType.Tap) {
        this.updateStroke(gs);
      }

      ret = true;
    }

    return ret;
  }

  /**
   * キャンバスを消去します。
   */
  public clear() {
    // キャンバス消去の履歴を追加する。
    // const historyItem = new ClearAllLayersHistoryItem();
    // historyItem.Layers = new List<RenderTarget2D>();
    // using(SpriteBatch sb = new SpriteBatch(gd))
    // {
    //   foreach(var layer in this.canvasImageValue.textures)
    //   {
    //     // すべてのレイヤーの内容を履歴にコピーする。
    //     var tex = new RenderTarget2D(this.GraphicsDevice, this.CanvasImage.Width,
    //    this.CanvasImage.Height,
    //       false, SurfaceFormat.Color, DepthFormat.None, 0, RenderTargetUsage.PreserveContents);
    //     gd.SetRenderTarget(tex);
    //     sb.Begin();
    //     sb.Draw(layer, Vector2.Zero, Color.White);
    //     sb.End();

    //     historyItem.Layers.Add(tex);
    //   }
    // }
    // CanvasHistoryManager.Instance.Add(historyItem);

    // すべてのレイヤーの内容を消去する。
    for (let i = 0; i < this.canvasImageValue.textures.length; i++) {
      const layer = this.canvasImageValue.textures[i];
      const ctx = layer.getContext("2d");

      if (!ctx) {
        break;
      }

      if (i === 0) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, layer.width, layer.height); // 背景レイヤーは白色で塗りつぶす。
      } else {
        ctx.clearRect(0, 0, layer.width, layer.height); // その他のレイヤーは黒の透明で塗りつぶす。
      }
    }
  }

  private updateStroke(gs: PaintGestureSample): void {
    this.strokeQueue.push(gs);
  }

  private drawStroke() {
    if (this.isClearCanvas === true) {
      this.isClearCanvas = false;
    }

    let gs: PaintGestureSample | undefined;
    while (this.strokeQueue.length > 0) {
      gs = this.strokeQueue.shift();
      if (!gs) {
        break;
      }

      if (gs.gestureType === PaintGestureType.Tap) {
        this.beginStrokeHistory();
        this.onTap(gs);
        this.endStrokeHistory();
      } else if (gs.gestureType === PaintGestureType.FreeDrag) {
        if (this.isDraging === false) {
          this.beginStrokeHistory();
        }

        this.onFreeDrag(gs);
      } else if (gs.gestureType === PaintGestureType.DragComplete) {
        this.onDragComplete();
        this.endStrokeHistory();
      }
    }
  }
  // #endregion 描画

  // #region 履歴
  private beginStrokeHistory() {
    console.log("onHoldCompleteHistory");
  }

  private endStrokeHistory() {
    console.log("endStrokeHistory");
  }

  private extendDartyRegion(p: BrushPoint) {
    console.log("extendDartyRegion");
  }
  // #endregion 履歴

  // #region イベント ハンドラー
  private onTap(gs: PaintGestureSample) {
    console.log("onTap");
    const bp = this.toBrushPoint(gs);

    this.renderer.drawPoint(bp);
    this.extendDartyRegion(bp);

    this.lastRenderedPoint = undefined;
  }

  private onFreeDrag(gs: PaintGestureSample) {
    // console.log('onFreeDrag', gs);
    const bp = this.toBrushPoint(gs);
    if (this.isDraging === false) {
      // まだドラッグが開始されていなかった場合は最初のポイントを描画する。
      this.renderer.drawPoint(bp);
      this.extendDartyRegion(bp);
      this.lastRenderedPoint = bp;
    } else {
      const p = this.renderer.drawLineFromLastPoint(bp, false);
      if (this.lastRenderedPoint !== p) {
        this.extendDartyRegion(bp);
      }

      this.lastRenderedPoint = p;
    }

    this.isDraging = true;
  }

  private onDragComplete() {
    console.log("onDragComplete");
    this.lastRenderedPoint = undefined;
    this.isDraging = false;
  }

  private onHold(gs: PaintGestureSample) {
    console.log("onHold");
  }

  private onHoldMove(gs: PaintGestureSample) {
    console.log("onHoldMove");
  }

  private onHoldComplete() {
    console.log("onHoldComplete");
  }
  // #endregion イベント ハンドラー

  // #region 変換
  public toBrushPoint(gs: PaintGestureSample): BrushPoint {
    const cp = this.transformScreenToCanvas(gs.position);
    const p = new BrushPoint();
    p.x = cp.x;
    p.y = cp.y;
    p.timeStamp = gs.timeStamp;
    p.pressureFactor = gs.pressureFactor;

    if (this.lastRenderedPoint) {
      const d = BrushPoint.distance(this.lastRenderedPoint, p);
      const t = p.timeStamp - this.lastRenderedPoint.timeStamp;
      p.speed = d / t;
    }
    return p;
  }

  private transformScreenToCanvas(screenPosition: Vector2): Vector2 {
    return screenPosition;
    // return this.canvasOrigin
    //   .add(screenPosition.sub(this.canvasPosition))
    //   .divideScalar(this.canvasScale);
  }
  // #endregion 変換
}
