import React from "react";
import forkRef from "react-fork-ref";

export type PrimaryDragReorderableAxis =
  | "left-to-right"
  | "right-to-left"
  | "top-to-bottom"
  | "bottom-to-top";
export type SecondaryDragReorderableAxis = "none" | PrimaryDragReorderableAxis;

export interface DragReorderEventParams {
  /**
   * The index of the value being reordered.
   */
  fromIndex: number;

  /**
   * The index the value is being reordered to.
   */
  toIndex: number;
}

export interface DragReorderableItemParams {
  /**
   * Whether the element for this value is being dragged.
   */
  isDragging: boolean;

  /**
   * Whether the dragged value is going to be dropped before this element.
   */
  isDropBefore: boolean;

  /**
   * Whether the dragged value is going to be dropped after this element.
   */
  isDropAfter: boolean;
}

export type DragReorderableRenderFunc<TValue = any> = (
  /**
   * The value this element is for.
   */
  value: TValue,
  /**
   * Parameters describing the drag or drop condition of this element.
   */
  params: DragReorderableItemParams,

  /**
   * A function to get the properties that should be applied to the root element.
   */
  getRootProps: <T extends React.HTMLProps<HTMLElement>>(
    props?: T & { ref?: React.Ref<HTMLElement> }
  ) => {
    ref: React.Ref<HTMLElement | null>;
  } & T,

  /***
   * A function to get the properties that should be applied to the draggable handle of this element.
   */
  getDragHandleProps: <T extends React.HTMLProps<HTMLElement>>(
    props?: T
  ) => {
    onPointerDown: React.PointerEventHandler<HTMLElement>;
    onPointerMove: React.PointerEventHandler<HTMLElement>;
    onPointerUp: React.PointerEventHandler<HTMLElement>;
  }
) => React.ReactElement;

export interface DragReorderableProps<TValue = any> {
  /**
   * The values representing draggable items.  The order of the values controls the order of the value components in the list.
   */
  values: readonly TValue[];

  /**
   * The primary direction of the reorderable.
   * This controls how this component will determine the relative order between elements during drag operations.
   */
  primaryAxis: PrimaryDragReorderableAxis;

  /**
   * The secondary direction of the reorderable.
   * This controls how this component will determine the relative order between elements during drag operations.
   */
  secondaryAxis?: SecondaryDragReorderableAxis;

  /**
   * An optional drop indicator to render between the items where a drop is currently being hovered.
   */
  dropIndicator?: JSX.Element;

  /**
   * An event raised when a reorder event occurs.
   * @param values The values in the new order.
   * @param params Parameters describing the reorder event.
   */
  onReorder(values: TValue[], params: DragReorderEventParams): void;

  /**
   * The render function for each reorderable component.
   */
  children: DragReorderableRenderFunc<TValue>;
}

interface ElementBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const DragReorderable = <TValue,>({
  values,
  primaryAxis,
  secondaryAxis = "none",
  dropIndicator,
  onReorder,
  children,
}: DragReorderableProps<TValue>) => {
  /**
   * The bounds of each child element matched to the index of the value it represents.
   */
  const childrenBoundsRef = React.useRef<(ElementBounds | null)[]>([]);

  const [dragIndex, setDragIndex] = React.useState(-1);
  const [dropIndex, setDropIndex] = React.useState(-1);

  const onBoundsChanged = React.useCallback(
    (valueIndex: number, bounds: ElementBounds | null) => {
      childrenBoundsRef.current[valueIndex] = bounds;
    },
    []
  );

  const onDragStart = React.useCallback(
    (valueIndex: number) => {
      if (dragIndex !== -1) {
        return;
      }
      setDragIndex(valueIndex);
    },
    [dragIndex]
  );

  const onDragMove = React.useCallback(
    (valueIndex: number, e: React.PointerEvent) => {
      // valueIndex should remain the dragIndex, as that element will have captured the pointer for the duration of the drag.

      if (dragIndex === -1) {
        return;
      }

      const index = getInsertionIndex(
        childrenBoundsRef.current.filter(isNotNull),
        primaryAxis,
        secondaryAxis,
        e.clientX,
        e.clientY
      );

      setDropIndex(index);
    },
    [dragIndex]
  );

  const onDragEnd = React.useCallback(
    (valueIndex: number) => {
      if (
        dragIndex === -1 ||
        dropIndex === -1 ||
        dragIndex === dropIndex ||
        // If we remove the item to place it in the place of the next item, the items will collapse back into their same positions.
        dragIndex + 1 === dropIndex
      ) {
        setDragIndex(-1);
        setDropIndex(-1);
        return;
      }

      const newValues = [...values];

      let newValueIndex = dropIndex;

      // Remove the item being dragged from the list.
      const draggedValue = values[dragIndex];
      newValues.splice(dragIndex, 1);

      if (dragIndex < newValueIndex) {
        // If the item we removed was before where we are dropping, decrement the drop index
        // to compensate for its removal.
        newValueIndex--;
      }

      newValues.splice(newValueIndex, 0, draggedValue);
      onReorder(newValues, { fromIndex: dragIndex, toIndex: dropIndex });

      setDragIndex(-1);
      setDropIndex(-1);
    },
    [dragIndex, dropIndex, values, onReorder]
  );

  return (
    <>
      {values.map((value, index) => (
        <React.Fragment key={index}>
          {dropIndex === index && dropIndicator}
          <DragReorderableItem
            valueIndex={index}
            dropIndex={dropIndex}
            value={value}
            isDragging={dragIndex === index}
            onBoundsChanged={onBoundsChanged}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
          >
            {children}
          </DragReorderableItem>
        </React.Fragment>
      ))}
      {dropIndex === values.length && dropIndicator}
    </>
  );
};

export default DragReorderable;

interface DragReorderableItemProps {
  valueIndex: number;
  dropIndex: number;
  value: any;
  isDragging: boolean;
  onBoundsChanged(valueIndex: number, bounds: ElementBounds | null): void;
  onDragStart(valueIndex: number): void;
  onDragMove(valueIndex: number, e: React.PointerEvent): void;
  onDragEnd(valueIndex: number, e: React.PointerEvent): void;
  children: DragReorderableRenderFunc;
}

const DragReorderableItem = ({
  valueIndex,
  dropIndex,
  value,
  isDragging,
  onBoundsChanged,
  onDragStart,
  onDragMove,
  onDragEnd,
  children,
}: DragReorderableItemProps) => {
  const [capturedPointerId, setCapturedPointerId] = React.useState<
    number | null
  >(null);

  const onPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (capturedPointerId !== null) {
        // Already captured one.
        return;
      }
      if (e.defaultPrevented) {
        return;
      }
      e.currentTarget.setPointerCapture(e.pointerId);
      setCapturedPointerId(e.pointerId);
      e.preventDefault();
      onDragStart(valueIndex);
    },
    [onDragStart, capturedPointerId, valueIndex]
  );

  const onPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (capturedPointerId !== e.pointerId) {
        return;
      }

      onDragMove(valueIndex, e);
    },
    [onDragMove, capturedPointerId, valueIndex]
  );

  const onPointerUp = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (capturedPointerId !== e.pointerId) {
        return;
      }

      e.currentTarget.releasePointerCapture(e.pointerId);
      setCapturedPointerId(null);
      onDragEnd(valueIndex, e);
    },
    [onDragEnd, capturedPointerId, valueIndex]
  );

  // Keep these synced to a ref so we can access them inside the mutation observer without having
  // to rebuild the observer on every change.
  const onBoundsRef = React.useRef(onBoundsChanged);
  const valueIndexRef = React.useRef(valueIndex);
  React.useEffect(() => {
    onBoundsRef.current = onBoundsChanged;
    valueIndexRef.current = valueIndex;
  }, [onBoundsChanged, valueIndex]);

  const observerRef = React.useRef<MutationObserver | null>(null);
  // Clean up the observer on unmount.
  React.useEffect(() => {
    return () => observerRef.current?.disconnect();
  }, []);

  // Build the mutation observer when the ref changes.
  const refCallback = (ref: HTMLElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    if (!ref) {
      onBoundsChanged(valueIndex, null);
      return;
    }

    const observer = new MutationObserver(() => {
      const { left, top, right, bottom } = ref.getBoundingClientRect();
      onBoundsChanged(valueIndexRef.current, { left, top, right, bottom });
    });

    observer.observe(ref, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });

    observerRef.current = observer;

    const { left, top, right, bottom } = ref.getBoundingClientRect();
    onBoundsChanged(valueIndexRef.current, { left, top, right, bottom });
  };

  return (
    <>
      {children(
        value,
        {
          isDragging,
          isDropBefore: dropIndex === valueIndex,
          isDropAfter: dropIndex + 1 === valueIndex,
        },
        (additionalProps = {} as any) => ({
          ...additionalProps,
          ref: forkRef(refCallback, additionalProps.ref ?? (() => {})),
        }),
        (additionalProps = {} as any) => ({
          ...additionalProps,
          onPointerDown,
          onPointerMove,
          onPointerUp,
        })
      )}
    </>
  );
};

type IndexedBounds = ElementBounds & { itemIndex: number };

/**
 * A group of children and their bounds along one span of an axis.
 */
interface ChildGroup {
  /**
   * The leftmost extent of every child in this group.
   */
  left: number;

  /**
   * The rightmost extent of every child in this group.
   */
  right: number;

  /**
   * The topmost extent of every child in this group.
   */
  top: number;

  /**
   * The bottommost extent of every child in this group.
   */
  bottom: number;

  /**
   * The bounds and index of every child in this group.
   */
  items: IndexedBounds[];
}

/**
 * Break the elements up into groups based on the primary and secondary axis.
 */
function getGroups(
  bounds: ElementBounds[],
  primaryAxis: PrimaryDragReorderableAxis,
  secondaryAxis: SecondaryDragReorderableAxis
): ChildGroup[] {
  let currentGroup: ChildGroup | null = null;
  const groups: ChildGroup[] = [];

  let lastPrimaryPosition: number | null = null;
  for (let i = 0; i < bounds.length; i++) {
    const bound = bounds[i];

    // Get the position of the element along the primary axis.
    let itemPrimaryPosition: number;
    switch (primaryAxis) {
      case "left-to-right":
        itemPrimaryPosition = bound.left;
        break;
      case "right-to-left":
        itemPrimaryPosition = bound.right;
        break;
      case "top-to-bottom":
        itemPrimaryPosition = bound.top;
        break;
      case "bottom-to-top":
        itemPrimaryPosition = bound.bottom;
        break;
    }

    if (
      // Start a group if we have not yet created one.
      !currentGroup ||
      // Check to see if we have started a new row due to wraparound onto the secondary axis.
      (secondaryAxis !== "none" &&
        lastPrimaryPosition != null &&
        // If we are ordering in reverse, then we need to start a new primary axis group
        // if the next item ends up less further along than the previous one.
        (axisIsFlipped(primaryAxis)
          ? itemPrimaryPosition > lastPrimaryPosition
          : itemPrimaryPosition < lastPrimaryPosition))
    ) {
      currentGroup = {
        left: bound.left,
        right: bound.right,
        top: bound.top,
        bottom: bound.bottom,
        items: [
          {
            ...bound,
            itemIndex: i,
          },
        ],
      };
      groups.push(currentGroup);
    } else {
      // The item is still within the current group.  Update the group to include it.
      currentGroup.left = Math.min(currentGroup.left, bound.left);
      currentGroup.right = Math.max(currentGroup.right, bound.right);
      currentGroup.top = Math.min(currentGroup.top, bound.top);
      currentGroup.bottom = Math.max(currentGroup.bottom, bound.bottom);
      currentGroup.items.push({
        ...bound,
        itemIndex: i,
      });
    }

    lastPrimaryPosition = itemPrimaryPosition;
  }

  if (axisIsFlipped(primaryAxis)) {
    groups.forEach((group) => group.items.reverse());
  }

  if (secondaryAxis !== "none" && axisIsFlipped(secondaryAxis)) {
    groups.reverse();
  }

  return groups;
}

/**
 * Determine the insertion point for the given mouse coords based on the bounds of all elements and the sort axes.
 */
function getInsertionIndex(
  bounds: ElementBounds[],
  primaryAxis: PrimaryDragReorderableAxis,
  secondaryAxis: SecondaryDragReorderableAxis,
  x: number,
  y: number
): number {
  const groups = getGroups(bounds, primaryAxis, secondaryAxis);
  if (groups.length === 0) {
    return -1;
  }

  // Find the target group along the secondary axis
  let targetGroup: ChildGroup | null = null;
  if (secondaryAxis === "none") {
    targetGroup = groups[0];
  } else {
    // Secondary axis is active, so we need to find which secondary axis group the mouse is over.
    const horizontalSecondary = axisIsHorizontal(secondaryAxis);
    for (const group of groups) {
      if (horizontalSecondary) {
        if (x < group.left || x > group.right) {
          continue;
        }
      } else {
        if (y < group.top || y > group.bottom) {
          continue;
        }
      }

      targetGroup = group;
      break;
    }
  }

  if (!targetGroup || !targetGroup.items.length) {
    return -1;
  }

  let primaryPosition = axisIsHorizontal(primaryAxis) ? x : y;
  for (let i = 0; i < targetGroup.items.length; i++) {
    const item = targetGroup.items[i];

    let itemPrimaryMin: number;
    let itemPrimaryMax: number;

    if (axisIsHorizontal(primaryAxis)) {
      itemPrimaryMin = item.left;
      itemPrimaryMax = item.right;
    } else {
      itemPrimaryMin = item.top;
      itemPrimaryMax = item.bottom;
    }

    if (primaryPosition < itemPrimaryMin) {
      // Mouse is past the previous item, not not yet at this item.
      // Use this item's index
      // TODO: Return which of the two the mouse is closer to.
      return item.itemIndex;
    }

    if (primaryPosition < itemPrimaryMax) {
      // Mouse is on this item
      const center = itemPrimaryMin + (itemPrimaryMax - itemPrimaryMin) / 2;
      if (primaryPosition < center) {
        // Mouse is closer to the start of this item, so return the item index to place the drop before us.
        return item.itemIndex;
      } else {
        // Mouse is closer to the end of this item, so return one after this index to place the drop after us.
        return item.itemIndex + 1;
      }
    }

    // Position was past this item, loop and search the next.
  }

  // If we didn't find an item by now, consider us past the last item on this axis.
  return targetGroup.items[targetGroup.items.length - 1].itemIndex + 1;
}

function axisIsHorizontal(axis: PrimaryDragReorderableAxis) {
  return axis === "left-to-right" || axis === "right-to-left";
}

function axisIsFlipped(axis: PrimaryDragReorderableAxis) {
  return axis === "right-to-left" || axis === "bottom-to-top";
}

function isNotNull<T>(x: T | null | undefined): x is T {
  return x != null;
}
