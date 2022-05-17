export interface NativePointerEvent {
  readonly altKey: boolean;
  readonly button: number;
  readonly buttons: number;
  readonly clientX: number;
  readonly clientY: number;
  readonly ctrlKey: boolean;
  readonly metaKey: boolean;
  readonly movementX: number;
  readonly movementY: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly pageX: number;
  readonly pageY: number;
  readonly pointerId: number;
  readonly pointerType: string;
  readonly pressure: number;
  readonly screenX: number;
  readonly screenY: number;
  readonly shiftKey: boolean;
  readonly tangentialPressure: number;
  readonly tiltX: number;
  readonly tiltY: number;
  readonly twist: number;
  readonly type: string;
  readonly x: number;
  readonly y: number;
}

export class NativePointerEventImplements implements NativePointerEvent {
  altKey = false;
  button = 0;
  buttons = 0;
  clientX = 0;
  clientY = 0;
  ctrlKey = false;
  metaKey = false;
  movementX = 0;
  movementY = 0;
  offsetX = 0;
  offsetY = 0;
  pageX = 0;
  pageY = 0;
  pointerId = 0;
  pointerType = "";
  pressure = 0;
  screenX = 0;
  screenY = 0;
  shiftKey = false;
  tangentialPressure = 0;
  tiltX = 0;
  tiltY = 0;
  twist = 0;
  type: string;
  x = 0;
  y = 0;

  constructor(type: string) {
    this.type = type;
  }

  static fromPointerEvent(pe: PointerEvent): NativePointerEvent {
    const ret = {
      altKey: pe.altKey,
      button: pe.button,
      buttons: pe.buttons,
      clientX: pe.clientX,
      clientY: pe.clientY,
      ctrlKey: pe.ctrlKey,
      metaKey: pe.metaKey,
      movementX: pe.movementX,
      movementY: pe.movementY,
      offsetX: pe.offsetX,
      offsetY: pe.offsetY,
      pageX: pe.pageX,
      pageY: pe.pageY,
      pointerId: pe.pointerId,
      pointerType: pe.pointerType,
      pressure: pe.pressure,
      screenX: pe.screenX,
      screenY: pe.screenY,
      shiftKey: pe.shiftKey,
      tangentialPressure: pe.tangentialPressure,
      type: pe.type,
      tiltX: pe.tiltX,
      tiltY: pe.tiltY,
      twist: pe.twist,
      x: pe.x,
      y: pe.y,
    };

    return ret;
  }
}
