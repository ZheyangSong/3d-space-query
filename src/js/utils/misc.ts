import { IBoxALike } from '../types';
import { subtract } from './vector-operators';

/**
 * Calculate the surface area (half) of given `box`.
 *
 * @param box a 3D aabb
 * @returns half of `box`'s surface area
 */
export function surfaceArea(box: IBoxALike) {
  const [xLen, yLen, zLen] = subtract(box.aabbMax, box.aabbMin);

  return xLen * yLen + yLen * zLen + zLen * xLen;
}

export function calcAxialMidPoint(box: IBoxALike, axis: number) {
  return box.aabbMin[axis] + (box.aabbMax[axis] - box.aabbMin[axis]) / 2;
}

export function simpleDeepClone<S = any>(serializable: S) {
  try {
    return JSON.parse(JSON.stringify(serializable));
  } catch {
    return serializable;
  }
}
