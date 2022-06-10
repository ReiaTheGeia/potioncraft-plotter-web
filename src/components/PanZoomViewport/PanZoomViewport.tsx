import * as React from "react";
import { styled } from "@mui/material";

import { getModifiers } from "@/modifier-keys";

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
      viewModel.zoom(e.deltaY < 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR, {
        x: e.clientX,
        y: e.clientY,
      });
      e.preventDefault();
      e.stopPropagation();
    } else if (modifiers.shiftKey) {
      viewModel.pan(-e.deltaY * PAN_FACTOR, 0, true);
      e.preventDefault();
      e.stopPropagation();
    } else {
      viewModel.pan(0, -e.deltaY * PAN_FACTOR, true);
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

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
    >
      {children}
    </Root>
  );
};

export default PanZoomViewport;
