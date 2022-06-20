import * as React from "react";
import { styled } from "@mui/material";

import { getModifiers } from "@/modifier-keys";
import { Vector2, vec2Subtract, Vec2Zero } from "@/vector2";

import { useComponentBounds } from "@/hooks/component-bounds";
import { useNativeEvent } from "@/hooks/native-event";

import { IPanZoomViewportViewModel } from "./PanZoomViewportViewModel";

export interface PanZoomHandlerProps {
  className?: string;
  viewModel: IPanZoomViewportViewModel;
  children: React.ReactNode;
}

export const ZOOM_FACTOR = 1.15;
export const PAN_FACTOR = 0.15;

const Root = styled("div")({
  width: "100%",
  height: "100%",
});

const PanZoomViewport = ({
  className,
  viewModel,
  children,
}: PanZoomHandlerProps) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const containerBounds = useComponentBounds(containerRef);
  const [dragPointer, setDragPointer] = React.useState<number | null>(null);
  const [mouseLastPos, setMouseLastPos] = React.useState<Vector2>(Vec2Zero);

  React.useLayoutEffect(() => {
    viewModel.onViewportResized(containerBounds.width, containerBounds.height);
  }, [containerBounds.width, containerBounds.height]);

  const onWheel = React.useCallback((e: WheelEvent) => {
    const target = containerRef.current;
    if (!target || e.defaultPrevented) {
      return;
    }

    const modifiers = getModifiers(e);

    if (modifiers.ctrlMetaKey) {
      viewModel.pan(0, e.deltaY * PAN_FACTOR, true);
      e.preventDefault();
      e.stopPropagation();
    } else if (modifiers.shiftKey) {
      viewModel.pan(-e.deltaY * PAN_FACTOR, 0, true);
      e.preventDefault();
      e.stopPropagation();
    } else {
      viewModel.zoom(e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR, {
        x: e.clientX,
        y: e.clientY,
      });
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragPointer != null) {
        return;
      }
      if (e.defaultPrevented) {
        return;
      }
      e.preventDefault();
      setDragPointer(e.pointerId);
      e.currentTarget.setPointerCapture(e.pointerId);
      setMouseLastPos({ x: e.clientX, y: e.clientY });
    },
    [dragPointer]
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (dragPointer == null) {
        return;
      }
      const p = { x: e.clientX, y: e.clientY };
      const delta = vec2Subtract(p, mouseLastPos);
      setMouseLastPos(p);
      // FIXME: Panning is miscalculated.  Mouse drifts from grab position.
      viewModel.pan(delta.x, -delta.y, true);
    },
    [mouseLastPos, viewModel]
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent) => {
      if (e.pointerId != dragPointer) {
        return;
      }
      setDragPointer(null);
      setMouseLastPos(Vec2Zero);
      e.currentTarget.releasePointerCapture(e.pointerId);
    },
    [dragPointer]
  );

  const onMouseOut = React.useCallback(
    () => viewModel.onMouseOut(),
    [viewModel]
  );

  // React listens to the root listener for all events,
  //  and chrome assumes the root event listener for mouse events
  //  never wants to preventDefault.
  // We need to take a local event listener and mark it as not passive.
  // https://github.com/facebook/react/issues/14856
  useNativeEvent(containerRef, "wheel", onWheel, { passive: false });

  return (
    <Root
      className={className}
      ref={containerRef}
      onMouseMove={(e) => viewModel.onMouseMove(e.clientX, e.clientY)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onMouseOut={onMouseOut}
    >
      {children}
    </Root>
  );
};

export default PanZoomViewport;
