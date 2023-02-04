import { IBoxALike, TPoint, NumericArrayLike } from "../types";
import { isPoint } from "./misc";

export function isIntersected(
  shape: IBoxALike | TPoint,
  bmin: NumericArrayLike,
  bmax: NumericArrayLike
) {
  if (isPoint(shape)) {
    return intersectPoint(shape, bmin, bmax);
  } else {
    return intersectBox(shape, bmin, bmax);
  }
}

function intersectBox(
  box: IBoxALike,
  bmin: NumericArrayLike,
  bmax: NumericArrayLike
) {
  return (
    box.aabbMax[0] >= bmin[0] &&
    box.aabbMin[0] <= bmax[0] &&
    box.aabbMax[1] >= bmin[1] &&
    box.aabbMin[1] <= bmax[1] &&
    box.aabbMax[2] >= bmin[2] &&
    box.aabbMin[2] <= bmax[2]
  );
}

function intersectPoint(
  point: TPoint,
  bmin: NumericArrayLike,
  bmax: NumericArrayLike
) {
  return (
    point[0] >= bmin[0] &&
    point[0] <= bmax[0] &&
    point[1] >= bmin[1] &&
    point[1] <= bmax[1] &&
    point[2] >= bmin[2] &&
    point[2] <= bmax[2]
  );
}
