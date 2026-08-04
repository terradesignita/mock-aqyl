import { useState } from "react";

/** Clamps `value` into the [min, max] range. */
export function clampWidth(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface ResizablePanelOptions {
  min: number;
  max: number;
}

/**
 * Drag-to-resize width state for a side panel. `startResize()` returns a
 * `mousedown` handler for the panel's resize handle.
 *
 * Pass `invert: true` for panels anchored on the right side of the layout
 * (handle on the panel's left edge, so dragging left grows the panel).
 */
export function useResizablePanel(initial: number, { min, max }: ResizablePanelOptions) {
  const [width, setWidth] = useState(initial);

  const startResize =
    (invert = false) =>
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = width;
      const onMove = (ev: MouseEvent) => {
        // The primary button can be released outside the browser window
        // (fast drag, multi-monitor) without a `mouseup` ever reaching us —
        // `buttons === 0` means it's already up, so stop resizing here too.
        if (ev.buttons === 0) {
          onUp();
          return;
        }
        const delta = invert ? startX - ev.clientX : ev.clientX - startX;
        setWidth(clampWidth(startWidth + delta, min, max));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        window.removeEventListener("blur", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
      window.addEventListener("blur", onUp);
    };

  return { width, setWidth, startResize };
}
