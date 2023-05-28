import { DropTargetMonitor } from "react-dnd";
import { isDroppable } from "./isDroppable";
import { NodeModel, TreeState, DragItem } from "~/types";

type CompareResult = "up" | "down";

type VerticalPosition = "upper" | "middle" | "lower";

type DropTarget = {
  id: NodeModel["id"];
  index: number;
} | null;

type CompareYCoord = (el: Element, pointerY: number) => CompareResult;

type GetInnerIndex = (
  listItems: NodeListOf<Element>,
  monitor: DropTargetMonitor
) => number;

type GetOuterIndex = (
  node: NodeModel,
  nodeEl: HTMLElement,
  monitor: DropTargetMonitor
) => number | null;

const compareYCoord: CompareYCoord = (el, pointerY) => {
  const bbox = el.getBoundingClientRect();
  const centerY = bbox.top + bbox.height / 2;
  return pointerY > centerY ? "down" : "up";
};

const getInnerIndex: GetInnerIndex = (listItems, monitor) => {
  let pos = "";
  let index = 0;

  listItems.forEach((el, key) => {
    const flag = compareYCoord(el, monitor.getClientOffset()?.y || 0);

    if (pos === "") {
      pos = flag;
    } else if (pos !== flag) {
      pos = flag;
      index = key;
    }

    if (key === listItems.length - 1 && flag === "down") {
      index = key + 1;
    }
  });
  return index;
};

const getOuterIndex: GetOuterIndex = (node, nodeEl, monitor) => {
  // const parentList = nodeEl.closest(`[role="list${node.parent}"]`);
  const parentListItems = document.querySelectorAll(
    `[role="listitem${node.parent}"]`
  );

  if (!parentListItems) {
    return null;
  }
  // console.log(
  //   "outer",
  //   parentListItems,
  //   `:scope > [role="listitem${node.parent}"]`
  // );
  return getInnerIndex(parentListItems, monitor);
};

const getHoverPosition = <T>(
  el: Element,
  pointerY: number,
  context: TreeState<T>
): VerticalPosition => {
  const bbox = el.getBoundingClientRect();
  const offsetY = context.dropTargetOffset;
  const upSideY = bbox.top + offsetY;
  const lowerSideY = bbox.bottom - offsetY;

  if (pointerY > lowerSideY) {
    return "lower";
  } else if (pointerY < upSideY) {
    return "upper";
  }

  return "middle";
};

export const getDropTarget = <T>(
  node: NodeModel<T> | null,
  nodeEl: HTMLElement | null,
  monitor: DropTargetMonitor,
  context: TreeState<T>
): DropTarget => {
  if (!nodeEl) {
    return null;
  }

  if (node === null) {
    const listItems = document.querySelectorAll(':scope > [role="listitem0"]');

    return {
      id: context.rootId,
      index: getInnerIndex(listItems, monitor),
    };
  }

  const dragSource: DragItem<T> = monitor.getItem();
  const list = document.querySelector(`[role="list${node.id}"]`);
  // console.log("list", list, "node", node);
  const hoverPosition = getHoverPosition(
    nodeEl,
    monitor.getClientOffset()?.y || 0,
    context
  );

  if (!list) {
    if (hoverPosition === "middle" && node.droppable) {
      // make sure its droppable
      return {
        id: node.id,
        index: 0,
      };
    }

    if (isDroppable(dragSource.id, node.parent, context)) {
      const outerIndex = getOuterIndex(node, nodeEl, monitor);

      if (outerIndex === null) {
        return null;
      }

      return {
        id: node.parent,
        index: outerIndex,
      };
    }

    return null;
  } else {
    if (hoverPosition === "upper") {
      if (isDroppable(dragSource.id, node.parent, context)) {
        const outerIndex = getOuterIndex(node, nodeEl, monitor);

        if (outerIndex === null) {
          return null;
        }

        return {
          id: node.parent,
          index: outerIndex,
        };
      } else {
        return {
          id: node.id,
          index: 0,
        };
      }
    }

    const listItems = document.querySelectorAll(
      `:scope > [role="listitem${node.id}"]`
    );

    return {
      id: node.id,
      index: getInnerIndex(listItems, monitor),
    };
  }
};
