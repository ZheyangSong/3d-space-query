import { BVHNode } from "./BVHNode";
import { IBoxALike } from "./types";
import { intersectAABB } from './utils';

export interface ISearchTree {
  bvhNodes: BVHNode[];
  primitiveIndices: number[];
}

export function search(target: IBoxALike, tree: ISearchTree) {
  const result: number[] = [];

  if (tree.bvhNodes.length) {
    intersect(target, 0, tree, result);
  }

  return result;
}

function intersect(
  target: IBoxALike,
  nodeIdx: number,
  tree: ISearchTree,
  result: number[]
) {
  const node = tree.bvhNodes[nodeIdx];

  if (!intersectAABB(target, node.aabbMin, node.aabbMax)) {
    return;
  }

  if (node.isLeaf) {
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
