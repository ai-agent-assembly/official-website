export interface RectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface MotionConditions {
  reduced: boolean;
  narrow: boolean;
  inView: boolean;
  pageVisible: boolean;
}

export function createFrameGate(
  request: (callback: () => void) => number,
  cancel: (handle: number) => void,
  tick: () => void,
): {start(): void; stop(): void; isRunning(): boolean};

export function shouldAnimate(conditions: MotionConditions): boolean;
export function isCompactScene(viewportWidth: number): boolean;

export function projectSafeRects(
  root: RectLike,
  targets: readonly RectLike[],
  clearance?: number,
): Array<{x: number; y: number; width: number; height: number}>;
