import { IBoxALike, NumericArrayLike } from '../types';

export function intersectAABB(box: IBoxALike, bmin: NumericArrayLike, bmax: NumericArrayLike) {
  return (
    box.aabbMax[0] >= bmin[0] &&
    box.aabbMin[0] <= bmax[0] &&
    box.aabbMax[1] >= bmin[1] &&
    box.aabbMin[1] <= bmax[1] &&
    box.aabbMax[2] >= bmin[2] &&
    box.aabbMin[2] <= bmax[2]
  );
}
