import { NodeModel } from "~/types";

type OpenModel<T> = NodeModel<T> & { open: boolean };
type FlatNode<T> = OpenModel<T> & { depth: number };
export const flatten = <T = unknown>(
  arr: OpenModel<T>[],
  parent: string | number,
  depth: number
): FlatNode<T>[] => {
  const flat = arr
    .filter((child) => child.parent === parent)
    .map((el) =>
      el.open
        ? [{ ...el, depth: depth }].concat(...flatten(arr, el.id, depth + 1))
        : { ...el, depth: depth }
    );
  return flat.flatMap((el) => el);
};
