/** A single owned RAF chain; repeated visibility/preference events cannot fork it. */
export function createFrameGate(request, cancel, tick) {
  let handle = null;
  let enabled = false;

  function frame() {
    handle = null;
    if (!enabled) return;
    tick();
    if (enabled) handle = request(frame);
  }

  return {
    start() {
      enabled = true;
      if (handle === null) handle = request(frame);
    },
    stop() {
      enabled = false;
      if (handle !== null) cancel(handle);
      handle = null;
    },
    isRunning() {
      return enabled;
    },
  };
}

export function shouldAnimate({reduced, narrow, inView, pageVisible}) {
  return !reduced && !narrow && inView && pageVisible;
}

export function isCompactScene(viewportWidth) {
  return viewportWidth <= 1024;
}

/** Canvas coordinates remain CSS pixels because its context is DPR-transformed. */
export function projectSafeRects(root, targets, clearance = 24) {
  return targets
    .filter((rect) => rect.width > 0 && rect.height > 0)
    .map((rect) => ({
      x: rect.left - root.left - clearance,
      y: rect.top - root.top - clearance,
      width: rect.width + clearance * 2,
      height: rect.height + clearance * 2,
    }));
}
