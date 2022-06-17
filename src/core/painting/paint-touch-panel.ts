import { Vector2 } from "three";
import { popScopeId } from "vue";
import { NativePointerEvent, NativePointerEventImplements } from "./NativePointerEvent";
import { GestureNativeState, PaintGestureSample, PaintGestureType } from "./paint-gesture-sample";

enum PointerEventType {
  pointerOver = "pointerover",
  pointerEnter = "pointerenter",
  pointerDown = "pointerdown",
  pointerMove = "pointermove",
  pointerUp = "pointerup",
  pointerCancel = "pointercancel",
  pointerOut = "pointerout",
  pointerLeave = "pointerleave",
  gotPointerCapture = "gotpointercapture",
  lostPointerCapture = "lostpointercapture",
}

/**
 * 描画用のタッチパネルを表します。
 */
export class PaintTouchPanel {
  /**
   * ピンチ操作の間隔を取得します。
   * PINCH_INTERVAL 以内に2点間が押された時、ピンチ状態に移行します。
   */
  private static readonly PINCH_INTERVAL = 200;

  /**
   * タップの間隔を取得します。
   * 押された後 TAP_INTERVAL 以内に離された時、タップ状態に移行します。
   */
  private static readonly TAP_INTERVAL = 700;

  /**
   * ダブルタップの間隔を取得します。
   * タップ状態から DOUBLE_TAP_INTERVAL 以内に押された時、ダブルタップ状態に移行します。
   */
  private static readonly DOUBLE_TAP_INTERVAL = 200;

  /**
   * ホールドまでの時間を取得します。
   * 押されたまま HOLD_INTERVAL 以上経った時、ホールド状態に移行します。
   */
  private static readonly HOLD_INTERVAL = 700;

  /**
   * タップの距離を取得します。
   * 押された後 TAP_DISTANCE 以上の距離を移動したとき、タップ操作が解除され移動状態に移行します。
   */
  private static readonly TAP_DISTANCE = 5;

  /**
   * ダブルタップの距離を取得します。
   * 最初にタップした後に、再び押されたとき DOUBLE_TAP_DISTANCE 以内の距離のとき、ダブルタップ状態に移行します。
   */
  private static readonly DOUBLE_TAP_DISTANCE = 30;

  /**
   * 移動の距離を取得します。
   */
  private freeDragDistance = 5;

  private samples: PaintGestureSample[] = [];

  private previousTouches: NativePointerEvent[] = [];

  private nativeStateValue: GestureNativeState = GestureNativeState.None;

  private nativeStateChangedTime: Date = new Date();

  private gestureType: PaintGestureType = PaintGestureType.None;

  private tapLocation: NativePointerEvent = new NativePointerEventImplements("none");

  /**
   * ジェスチャーが有効かどうかを示す値を取得します。
   */
  public get isGestureAvailable(): boolean {
    return this.samples.length > 0;
  }

  /**
   * ジェスチャー サンプルのリストを取得します。
   */
  public get gestureSamples(): PaintGestureSample[] {
    return this.samples;
  }

  private get nativeState(): GestureNativeState {
    return this.nativeStateValue;
  }

  private set nativeState(value: GestureNativeState) {
    if (this.nativeStateValue === value) {
      return;
    }
    this.nativeStateValue = value;
    this.nativeStateChangedTime = new Date();
  }

  // #region ジェスチャー
  /**
   * 最初の要素を取り除き、その値を返します。
   * @returns 最初の要素
   */
  public readGesture(): PaintGestureSample | undefined {
    return this.samples.shift();
  }

  public update(pe: NativePointerEvent) {
    const touches = [pe];
    if (touches.length === 0) {
      this.gestureType = PaintGestureType.None;
    }

    switch (this.gestureType) {
      case PaintGestureType.None:
        this.transitionNoneState(touches);
        break;
      case PaintGestureType.Pinch:
        this.transitionPinchState(touches);
        break;
      case PaintGestureType.PinchComplete:
        this.transitionPinchCompleteState(touches);
        break;
      case PaintGestureType.Hold:
        this.transitionHoldState(touches[0]);
        break;
      case PaintGestureType.HoldMove:
        this.transitionHoldMoveState(touches[0]);
        break;
      case PaintGestureType.HoldComplete:
        this.transitionHoldCompleteState(touches[0]);
        break;
      case PaintGestureType.DragComplete:
        this.transitionDragCompleteState(touches);
        break;
      case PaintGestureType.FreeDrag:
        this.transitionFreeDragState(touches[0]);
        break;
      case PaintGestureType.Tap:
        break;
      case PaintGestureType.DoubleTap:
        break;
      default:
        break;
    }

    this.previousTouches = touches;
  }

  private transitionNoneState(touches: NativePointerEvent[]) {
    const now = new Date().getTime();
    const stateChanged = this.nativeStateChangedTime.getTime();

    if (touches.length === 0) {
      // タッチされていない状態の場合。
      if (this.nativeStateValue === GestureNativeState.SingleTap) {
        if (now - stateChanged > PaintTouchPanel.DOUBLE_TAP_INTERVAL) {
          // DOUBLE_TAP_INTERVAL より 何もしない状態が続いた場合は SingleTap にする。
          this.nativeStateValue = GestureNativeState.None;

          this.onTap(this.tapLocation);
        }
      }
      return;
    }

    const tl = touches[0];
    let delta = new Vector2();
    if (this.previousTouches.length > 0) {
      const ptl = this.previousTouches[0];
      delta = PaintTouchPanel.pointerToVector2(tl).sub(PaintTouchPanel.pointerToVector2(ptl));
    }

    if (this.nativeStateValue === GestureNativeState.Pressed) {
      if (tl.type === PointerEventType.pointerMove) {
        if (now - stateChanged > PaintTouchPanel.HOLD_INTERVAL) {
          this.nativeStateValue = GestureNativeState.None;
          this.onHold(tl);
        } else if (delta.length() > PaintTouchPanel.TAP_DISTANCE) {
          // TAP_DISTANCE より移動量が大きい場合は Moved 状態にする。
          this.nativeStateValue = GestureNativeState.Moved;

          this.onFreeDrag(this.previousTouches[0]);
        } else if (
          touches.length > 1 &&
          touches.slice(0, 2).some((t) => t.type === PointerEventType.pointerMove)
        ) {
          // 2点が Moved した場合は Pinch イベント
          this.nativeStateValue = GestureNativeState.Moved;
        } else {
          return;
        }
      } else if (tl.type === PointerEventType.pointerUp) {
        if (now - stateChanged < PaintTouchPanel.TAP_INTERVAL) {
          // TAP_INTERVAL より短い場合。
          this.tapLocation = tl;
          this.nativeStateValue = GestureNativeState.SingleTap;
        } else {
          this.nativeStateValue = GestureNativeState.None;
        }
        return;
      }
    } else if (this.nativeStateValue === GestureNativeState.SingleTap) {
      if (tl.type === PointerEventType.pointerDown) {
        if (!this.tapLocation) {
          return;
        }
        const d = PaintTouchPanel.pointerToVector2(tl).sub(
          PaintTouchPanel.pointerToVector2(this.tapLocation)
        );
        if (
          now - stateChanged < PaintTouchPanel.DOUBLE_TAP_INTERVAL &&
          d.length() < PaintTouchPanel.DOUBLE_TAP_DISTANCE
        ) {
          this.nativeStateValue = GestureNativeState.SingleTapPressed;
        } else {
          // DOUBLE_TAP_INTERVAL より長い場合。
          this.nativeStateValue = GestureNativeState.None;

          // 前回のタップイベントを発行する。
          this.onTap(this.tapLocation);
          this.onTap(tl);
        }
        return;
      }
    } else if (this.nativeStateValue === GestureNativeState.SingleTapPressed) {
      if (tl.type === PointerEventType.pointerMove) {
        if (now - stateChanged > PaintTouchPanel.DOUBLE_TAP_INTERVAL) {
          // DOUBLE_TAP_INTERVAL より長い場合。
          this.nativeStateValue = GestureNativeState.None;

          // 前回のタップイベントを発行する。
          this.onTap(this.tapLocation);
        }
        return;
      }
      if (tl.type === PointerEventType.pointerUp) {
        if (now - stateChanged < PaintTouchPanel.DOUBLE_TAP_INTERVAL) {
          this.nativeStateValue = GestureNativeState.None;
          this.onDoubleTap(tl);
        } else {
          this.onTap(tl);
        }
        return;
      }
    }

    if (tl.type === PointerEventType.pointerDown) {
      this.nativeStateValue = GestureNativeState.Pressed;
    } else if (tl.type === PointerEventType.pointerMove) {
      if (this.nativeStateValue === GestureNativeState.Moved) {
        if (
          now - stateChanged > PaintTouchPanel.PINCH_INTERVAL ||
          delta.length() > this.freeDragDistance
        ) {
          // PINCH_INTERVAL より Moved が続いた場合。
          this.nativeStateValue = GestureNativeState.None;

          this.onFreeDrag(tl);
        } else if (
          touches.length > 1 &&
          touches.slice(0, 2).some((t) => t.type === PointerEventType.pointerMove)
        ) {
          // PINCH_INTERVAL 以内に2点が Moved した場合。
          this.nativeStateValue = GestureNativeState.None;

          this.onPinch(touches);
        }
      } else {
        this.nativeStateValue = GestureNativeState.Moved;
      }
    }
  }

  private transitionPinchState(touches: NativePointerEvent[]) {
    if (touches.slice(0, 2).some((t) => t.type === PointerEventType.pointerUp)) {
      this.onPinchComplete();
    } else {
      this.onPinch(touches);
    }
  }

  private transitionPinchCompleteState(touches: NativePointerEvent[]) {
    this.gestureType = PaintGestureType.None;
  }

  private transitionFreeDragState(touchLocation: NativePointerEvent) {
    if (touchLocation.type === PointerEventType.pointerUp) {
      this.onDragComplete();
    } else {
      this.onFreeDrag(touchLocation);
    }
  }

  private transitionDragCompleteState(touches: NativePointerEvent[]) {
    this.gestureType = PaintGestureType.None;
  }

  private transitionHoldState(touchLocation: NativePointerEvent) {
    if (touchLocation.type === PointerEventType.pointerUp) {
      this.gestureType = PaintGestureType.None;
    } else if (touchLocation.type === PointerEventType.pointerMove) {
      this.onHoldMove(touchLocation);
    }
  }

  private transitionHoldMoveState(touchLocation: NativePointerEvent) {
    if (touchLocation.type === PointerEventType.pointerUp) {
      this.onHoldComplete();
    } else {
      this.onHoldMove(touchLocation);
    }
  }

  private transitionHoldCompleteState(touchLocation: NativePointerEvent) {
    this.gestureType = PaintGestureType.None;
  }

  // #endregion ジェスチャー

  // #region イベント ハンドラー
  private onFreeDrag(touchLocation: NativePointerEvent) {
    const pos = PaintTouchPanel.pointerToVector2(touchLocation);
    let delta = new Vector2();

    this.gestureType = PaintGestureType.FreeDrag;

    if (this.previousTouches.length > 0) {
      // 前回のタッチ位置が存在する場合はその差分を計算する。
      const ptl = this.previousTouches[0];
      delta = PaintTouchPanel.pointerToVector2(touchLocation).sub(
        PaintTouchPanel.pointerToVector2(ptl)
      );
    }

    const freeDragItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: pos,
      position2: new Vector2(),
      positionId: touchLocation.pointerId,
      positionId2: 0,
      delta,
      delta2: new Vector2(),
      pressureFactor: touchLocation.pressure,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(freeDragItem);
  }

  private onDragComplete() {
    this.gestureType = PaintGestureType.DragComplete;

    const dragCompleteItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: new Vector2(),
      position2: new Vector2(),
      positionId: 0,
      positionId2: 0,
      delta: new Vector2(),
      delta2: new Vector2(),
      pressureFactor: 0,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(dragCompleteItem);
  }

  private onPinch(touches: NativePointerEvent[]) {
    const tl = touches[0];
    const ptl = this.previousTouches[0];
    const pos = PaintTouchPanel.pointerToVector2(tl);
    const delta = pos.sub(PaintTouchPanel.pointerToVector2(ptl));

    this.gestureType = PaintGestureType.Pinch;

    if (touches.length > 1 && this.previousTouches.length > 1) {
      // ピンチ操作
      const tl2 = touches[1];
      const ptc2 = this.previousTouches[1];
      const pos2 = PaintTouchPanel.pointerToVector2(tl2);
      const delta2 = pos2.sub(PaintTouchPanel.pointerToVector2(ptc2));
      if (delta.length() > 0 || delta2.length() > 0) {
        const pinchItem: PaintGestureSample = {
          gestureType: this.gestureType,
          position: pos,
          position2: pos2,
          positionId: tl.pointerId,
          positionId2: tl2.pointerId,
          delta,
          delta2,
          pressureFactor: tl.pressure,
          pressureFactor2: tl2.pressure,
          timeStamp: new Date().getTime(),
        };
        this.samples.push(pinchItem);
      }
    }
  }

  private onPinchComplete() {
    this.gestureType = PaintGestureType.PinchComplete;

    const pinchCompleteItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: new Vector2(),
      position2: new Vector2(),
      positionId: 0,
      positionId2: 0,
      delta: new Vector2(),
      delta2: new Vector2(),
      pressureFactor: 0,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(pinchCompleteItem);
  }

  private onTap(touchLocation: NativePointerEvent) {
    this.gestureType = PaintGestureType.Tap;

    const tapItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: PaintTouchPanel.pointerToVector2(touchLocation),
      position2: new Vector2(),
      positionId: touchLocation.pointerId,
      positionId2: 0,
      delta: new Vector2(),
      delta2: new Vector2(),
      pressureFactor: touchLocation.pressure,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(tapItem);
  }

  private onDoubleTap(touchLocation: NativePointerEvent) {
    this.gestureType = PaintGestureType.DoubleTap;

    const doubleTapItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: PaintTouchPanel.pointerToVector2(touchLocation),
      position2: new Vector2(),
      positionId: touchLocation.pointerId,
      positionId2: 0,
      delta: new Vector2(),
      delta2: new Vector2(),
      pressureFactor: touchLocation.pressure,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(doubleTapItem);
  }

  private onHold(touchLocation: NativePointerEvent) {
    this.gestureType = PaintGestureType.Hold;

    const holdItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: PaintTouchPanel.pointerToVector2(touchLocation),
      position2: new Vector2(),
      positionId: touchLocation.pointerId,
      positionId2: 0,
      delta: new Vector2(),
      delta2: new Vector2(),
      pressureFactor: touchLocation.pressure,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(holdItem);
  }

  private onHoldMove(touchLocation: NativePointerEvent) {
    let delta = new Vector2();

    this.gestureType = PaintGestureType.HoldMove;

    if (this.previousTouches.length > 0) {
      // 前回のタッチ位置が存在する場合はその差分を計算する。
      const ptl = this.previousTouches[0];
      delta = PaintTouchPanel.pointerToVector2(touchLocation).sub(
        PaintTouchPanel.pointerToVector2(ptl)
      );
    }

    const holdMoveItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: PaintTouchPanel.pointerToVector2(touchLocation),
      position2: new Vector2(),
      positionId: touchLocation.pointerId,
      positionId2: 0,
      delta,
      delta2: new Vector2(),
      pressureFactor: touchLocation.pressure,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(holdMoveItem);
  }

  private onHoldComplete() {
    this.gestureType = PaintGestureType.HoldComplete;

    const holdCompleteItem: PaintGestureSample = {
      gestureType: this.gestureType,
      position: new Vector2(),
      position2: new Vector2(),
      positionId: 0,
      positionId2: 0,
      delta: new Vector2(),
      delta2: new Vector2(),
      pressureFactor: 0,
      pressureFactor2: 0,
      timeStamp: new Date().getTime(),
    };

    this.samples.push(holdCompleteItem);
  }

  private static pointerToVector2(p: NativePointerEvent): Vector2 {
    return new Vector2(p.offsetX, p.offsetY);
  }
  // #endregion イベント ハンドラー
}
