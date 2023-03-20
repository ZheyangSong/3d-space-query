export class BVHNode {
  static SIZE = 3 + 3 + 1 +1;

  public aabbMin: number[];
  public aabbMax: number[];
  /**
   * when primCount is 0, this stores index of left bvh child node,
   * otherwise, this stores index of the 1st primitive index
   */
  leftFirst: number = 0;
  primCount: number = 0;

  constructor() {
    this.aabbMax = [-Infinity, -Infinity, -Infinity];
    this.aabbMin = [Infinity, Infinity, Infinity];
  }
}
