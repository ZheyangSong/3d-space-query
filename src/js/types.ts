export type NumericArrayLike = number[] | { [key: number]: number };

export interface IBoxALike {
  aabbMin: NumericArrayLike;
  aabbMax: NumericArrayLike;
}
