import * as React from "react";

interface UseComponentBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}
export function useComponentBounds(ref: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = React.useState<UseComponentBounds>({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
  });

  React.useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const el = ref.current;
      if (!el) {
        return;
      }
      const b = el.getBoundingClientRect();
      setSize({
        top: b.top,
        left: b.left,
        right: b.right,
        bottom: b.bottom,
        width: b.width,
        height: b.height,
      });
    });

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}
