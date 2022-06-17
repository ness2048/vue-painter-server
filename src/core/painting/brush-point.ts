import * as THREE from "three";
import { Vector2 } from "three";

/**
 * ブラシの点を表します。
 */
export class BrushPoint {
  /**
   * X 座標。
   */
  public x = 0;

  /**
   * Y 座標。
   */
  public y = 0;

  /**
   * ブラシの時刻。
   */
  public timeStamp: number = new Date().getTime();

  /**
   * 筆圧。
   */
  public pressureFactor = 0;

  /**
   * 角度。
   */
  public angle = 0;

  /**
   * 速度。
   */
  public speed = 0;

  /**
   * 2点間の距離を計算します。
   * @param p1 点
   * @param p2 点
   * @returns 距離
   */
  public static distance(p1: BrushPoint, p2: BrushPoint): number {
    return p1.toVector2().distanceTo(p2.toVector2());
  }

  /**
   * BrushPoint オブジェクトを Vector2 オブジェクトに変換します。
   * @returns 距離
   */
  public toVector2(): THREE.Vector2 {
    return new Vector2(this.x, this.y);
  }
}
