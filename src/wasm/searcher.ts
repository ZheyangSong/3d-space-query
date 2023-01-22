import { BVHNode } from "../js/BVHNode";
import { IBoxALike } from "../js/types";

export interface ISearchTree {
  bvhNodes: BVHNode[];
  primitiveIndices: number[];
}

export function search(target: IBoxALike, tree: ISearchTree) {
  const result: number[] = [];

  if (tree.bvhNodes.length) {
    intersectBVH(target, 0, tree, result);
  }

  return result;
}

function intersectBVH(
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
    intersectBVH(target, node.leftFirst, tree, result);
    intersectBVH(target, node.leftFirst + 1, tree, result);
  }
}

function intersectAABB(box: IBoxALike, bmin: number[], bmax: number[]) {
  return (
    box.aabbMax[0] >= bmin[0] &&
    box.aabbMin[0] <= bmax[0] &&
    box.aabbMax[1] >= bmin[1] &&
    box.aabbMin[1] <= bmax[1] &&
    box.aabbMax[2] >= bmin[2] &&
    box.aabbMin[2] <= bmax[2]
  );
}
