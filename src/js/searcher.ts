import { BVHNode } from "./BVHNode";
import { IBoxALike, TPoint } from "./types";
import { isIntersected } from "./utils";

export interface ISearchTree {
  bvhNodes: BVHNode[];
  primitiveIndices: number[];
}

export function search(target: IBoxALike | TPoint, tree: ISearchTree) {
  const result: number[] = [];

  if (tree.bvhNodes.length) {
    intersect(target, 0, tree, result);
  }

  return result;
}

function intersect(
  target: IBoxALike | TPoint,
  nodeIdx: number,
  tree: ISearchTree,
  result: number[]
) {
  const node = tree.bvhNodes[nodeIdx];

  if (!isIntersected(target, node.aabbMin, node.aabbMax)) {
    return;
  }

  if (isLeaf(node)) {
    result.push(
      ...tree.primitiveIndices.slice(
        node.leftFirst,
        node.leftFirst + node.primCount
      )
    );
  } else {
    intersect(target, node.leftFirst, tree, result);
    intersect(target, node.leftFirst + 1, tree, result);
  }
}

function isLeaf(node: BVHNode) {
  return node.primCount > 0;
}
