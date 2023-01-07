export type NumericArrayLike = number[] | { [key: number]: number };

export interface IBoxALike {
  aabbMin: NumericArrayLike;
  aabbMax: NumericArrayLike;
}

export interface IPrimitive extends IBoxALike {
  centroid: NumericArrayLike;
}
