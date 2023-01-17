import { BVHNode } from '../js/BVHNode';
import { IBoxALike } from '../js/types';

export interface ISearchTree {
  bvhNodes: BVHNode[],
  primitiveIndices: number[],
}

export function search(target: IBoxALike, tree: ISearchTree) {
  const result: number[] = [];

  if (tree.bvhNodes.length) {
    intersectBVH(target, 0, tree, result);
  }

  return result;
}

function intersectBVH(target: IBoxALike, nodeIdx: number, tree: ISearchTree, result: number[]) {
  const { bvhNodes, primitiveIndices } = tree;

  const node = bvhNodes[nodeIdx];
  if (!intersectAABB(target, node.aabbMin, node.aabbMax)) return;
  if (node.isLeaf) {
    for (let i = 0; i < node.primCount; i++) {
      result.push(primitiveIndices[node.leftFirst + i]);
    }
  } else {
    intersectBVH(target, node.leftFirst, tree, result);
    intersectBVH(target, node.leftFirst + 1, tree, result);
  }
}

function intersectAABB(box: IBoxALike, bmin: number[], bmax: number[]) {
  let result = true;

  for (let axis = 0; axis < 3 && result; axis++) {
    result =
      result &&
      !(box.aabbMax[axis] < bmin[axis] || box.aabbMin[axis] > bmax[axis]);
  }

  return result;
}
