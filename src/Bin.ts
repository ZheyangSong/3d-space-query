import { AABB } from './AABB';

export class Bin {
  public readonly bounds: AABB;
  public primCount: number = 0;

  constructor() {
    this.bounds = new AABB();
  }

  reset(): void {
    this.primCount = 0;
    this.bounds.reset();
  }
}
