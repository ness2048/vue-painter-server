import { Vector2 } from "three";

/**
 * ジェスチャーの内部状態を表します。
 */
export enum GestureNativeState {
  /**
   * 何もない。
   */
  None,

  /**
   * 移動した。
   */
  Moved,

  /**
   * 押された。
   */
  Pressed,

  /**
   * シングルタップされた。
   */
  SingleTap,

  /**
   * シングルタップ後押された。
   */
  SingleTapPressed,
}

/**
 * ジェスチャーのタイプを表します。
 */
export enum PaintGestureType {
  /**
   * 何もない。
   */
  None,

  /**
   * ピンチ。
   */
  Pinch,

  /**
   * ピンチが完了した。
   */
  PinchComplete,

  /**
   * ホールド。
   */
  Hold,

  /**
   * ホールド移動。
   */
  HoldMove,

  /**
   * ホールド移動が完了した。
   */
  HoldComplete,

  /**
   * ドラッグが完了した。
   */
  DragComplete,

  /**
   * ドラッグ。
   */
  FreeDrag,

  /**
   * タップ。
   */
  Tap,

  /**
   * ダブルタップ。
   */
  DoubleTap,
}

/**
 * ジェスチャーのサンプリングデータを表します。
 * 親指と人差し指の2点まで表現できます。
 */
export interface PaintGestureSample {
  /**
   *position の移動量。
   */
  delta: Vector2;

  /**
   * position2 の移動量。
   */
  delta2: Vector2;

  /**
   * ジェスチャーの種類。
   */
  gestureType: PaintGestureType;

  /**
   * 点の位置。
   */
  position: Vector2;

  /**
   * 点2の位置。
   */
  position2: Vector2;

  /**
   * 点を識別する ID。
   */
  positionId: number;

  /**
   * 点2を識別する ID 。
   */
  positionId2: number;

  /**
   * 筆圧。
   */
  pressureFactor: number;

  /**
   * 点2の筆圧。
   */
  pressureFactor2: number;

  /**
   * ジェスチャーの時刻。
   */
  timeStamp: number;
}
