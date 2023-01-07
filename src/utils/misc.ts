import { IBoxALike } from '../types';
import { subtract } from './vector-operators';

/**
 * Calculate the surface area (half) of given `box`.
 *
 * @param box a 3D aabb
 * @returns half of `box`'s surface area
 */
export function surfaceArea(box: IBoxALike): number {
  const [xLen, yLen, zLen] = subtract(box.aabbMax, box.aabbMin);

  return xLen * yLen + yLen * zLen + zLen * xLen;
}
