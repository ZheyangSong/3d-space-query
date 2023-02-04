import { IBoxALike } from "./types";
import { expandToMax, expandToMin, surfaceArea } from "./utils";

export class AABB implements IBoxALike {
  public aabbMin: number[];
  public aabbMax: number[];

  constructor() {
    this.aabbMax = [-Infinity, -Infinity, -Infinity];
    this.aabbMin = [Infinity, Infinity, Infinity];
  }

  public grow(obj: IBoxALike): void {
    expandToMin(this.aabbMin, obj.aabbMin);
    expandToMax(this.aabbMax, obj.aabbMax);
  }

  public area(): number {
    return surfaceArea(this);
  }

  public reset(): void {
    this.aabbMin[0] = Infinity;
    this.aabbMin[1] = Infinity;
    this.aabbMin[2] = Infinity;

    this.aabbMax[0] = -Infinity;
    this.aabbMax[1] = -Infinity;
    this.aabbMax[2] = -Infinity;
  }
}
