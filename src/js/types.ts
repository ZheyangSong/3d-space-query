export type NumericArrayLike = number[] | { [key: number]: number };

export interface IBoxALike {
  aabbMin: NumericArrayLike;
  aabbMax: NumericArrayLike;
}

export type TPoint = NumericArrayLike;

export interface IPacked {
  bvhNodes: Float32Array;
  primitiveIndices: Uint32Array;
  NODE_SIZE: number;
}
