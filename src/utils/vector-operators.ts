import { NumericArrayLike } from '../types';

/**
 * Expand all dimensions of vector `a` by vector `b` as lower bound.
 *
 * @param a vector to expand
 * @param b reference vector
 */
export function expandToMin(a: NumericArrayLike, b: NumericArrayLike): void {
  a[0] = Math.min(a[0], b[0]);
  a[1] = Math.min(a[1], b[1]);
  a[2] = Math.min(a[2], b[2]);
}

/**
 * Expand all dimensions of vector `a` by vector `b` as upper bound.
 *
 * @param a vector to expand
 * @param b reference vector
 */
export function expandToMax(a: NumericArrayLike, b: NumericArrayLike): void {
  a[0] = Math.max(a[0], b[0]);
  a[1] = Math.max(a[1], b[1]);
  a[2] = Math.max(a[2], b[2]);
}

export function subtract(a: NumericArrayLike, b: NumericArrayLike) {
  return [
    (a[0] - b[0]) || 0,
    (a[1] - b[1]) || 0,
    (a[2] - b[2]) || 0,
  ]
}
