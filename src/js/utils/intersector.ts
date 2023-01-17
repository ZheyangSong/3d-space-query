import { IBoxALike, NumericArrayLike } from '../types';

export function intersectAABB(box: IBoxALike, bmin: NumericArrayLike, bmax: NumericArrayLike): boolean {
  let result = true;

  for (let axis = 0; axis < 3 && result; axis++) {
    result =
      result &&
      !(box.aabbMax[axis] < bmin[axis] || box.aabbMin[axis] > bmax[axis]);
  }

  return result;
}
