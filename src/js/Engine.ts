import { BVHNode } from './BVHNode';
import { AABB } from './AABB';
import { Bin } from './Bin';
import { BestSplit } from './Bestsplit';
import { expandToMin, expandToMax, surfaceArea, simpleDeepClone, calcAxialMidPoint } from './utils';
import type { IBoxALike } from './types';
import { search } from './searcher';

export class Engine {
  public static from(obj: {
    bvhNodes: BVHNode[],
    primitiveIndices: number[],
  }) {
    const e = new Engine();

    e.bvhNodes = simpleDeepClone(obj.bvhNodes);
    e.primitiveIndices = simpleDeepClone(obj.primitiveIndices);
    e.nodesUsed = e.bvhNodes!.length;

    return e;
  }

  private bvhNodes: BVHNode[] | null = null;
  private primitiveIndices: number[] | null = null;
  private nodesUsed: number = 1;
  private binCnt = 4;
  private lastBinIdx = this.binCnt - 1;
  private bin: Bin[];
  private leftArea: number[];
  private rightArea: number[];
  private leftCount: number[];
  private rightCount: number[];
  private leftBox: AABB;
  private rightBox: AABB;

  public get balanceFactor() {
    return this.binCnt;
  }

  constructor() {
    this.init();
  }

  private init() {
    this.lastBinIdx = this.binCnt - 1;

    this.bin = new Array<Bin>(this.binCnt);
    for (let i = 0; i < this.binCnt; i++) {
      this.bin[i] = new Bin();
    }

    this.leftArea = new Array<number>(this.lastBinIdx);
    this.rightArea = new Array<number>(this.lastBinIdx);
    this.leftCount = new Array<number>(this.lastBinIdx);
    this.rightCount = new Array<number>(this.lastBinIdx);
    this.leftBox = new AABB();
    this.rightBox = new AABB();
  }

  public build(primitives: IBoxALike[], balanceFactor?: number): void {
    if (balanceFactor && this.binCnt !== balanceFactor) {
      this.binCnt = balanceFactor;
      this.init();
    }

    this.nodesUsed = 1;

    const rootNodeIdx = 0;
    const N = primitives.length;

    const nodeTotal = 2 * N - 1;
    this.bvhNodes = new Array<BVHNode>(nodeTotal);
    for (let i = 0; i < nodeTotal; i++) {
      this.bvhNodes[i] = new BVHNode();
    }

    this.primitiveIndices = new Array<number>(N);
    for (let i = 0; i < N; i++) {
      this.primitiveIndices[i] = i;
    }

    const root = this.bvhNodes[rootNodeIdx];
    root.leftFirst = 0;
    root.primCount = N;

    this.updateNodeBounds(rootNodeIdx, primitives);
    this.subdivide(rootNodeIdx, primitives);
  }

  private updateNodeBounds(nodeIdx: number, primitives: IBoxALike[]): void {
    const node = this.bvhNodes![nodeIdx];

    if (!node.primCount) {
      return;
    }

    const last = node.leftFirst + node.primCount;
  
    for (let i = node.leftFirst; i < last; i++) {
      const primitive = primitives[this.primitiveIndices![i]];

      expandToMin(node.aabbMin, primitive.aabbMin);
      expandToMax(node.aabbMax, primitive.aabbMax);
    }
  }

  private subdivide(nodeIdx: number, primitives: IBoxALike[]): void {
    const node = this.bvhNodes![nodeIdx];
  
    const { axis, splitPlane, splitCost } = this.findBestSplitPlane(
      node,
      primitives
    );
    const nodeCost = this.calculateNodeCost(node);

    if (splitCost >= nodeCost) {
      return;
    }
  
    let i = node.leftFirst;
    let j = i + node.primCount - 1;
    while (i <= j) {
      const primitive = primitives[this.primitiveIndices![i]];
      const axialMidPoint = calcAxialMidPoint(primitive, axis);

      if (axialMidPoint < splitPlane) {
        i++;
      } else {
        this.swap(i, j--, this.primitiveIndices!);
      }
    }
  
    const leftCount = i - node.leftFirst;
    if (leftCount === 0 || leftCount === node.primCount) {
      return;
    }
  
    const leftChildIdx = this.nodesUsed++;
    const rightChildIdx = this.nodesUsed++;
    this.bvhNodes![leftChildIdx].leftFirst = node.leftFirst;
    this.bvhNodes![leftChildIdx].primCount = leftCount;
    this.bvhNodes![rightChildIdx].leftFirst = i;
    this.bvhNodes![rightChildIdx].primCount = node.primCount - leftCount;
    node.leftFirst = leftChildIdx;
    node.primCount = 0;
    this.updateNodeBounds(leftChildIdx, primitives);
    this.updateNodeBounds(rightChildIdx, primitives);
    this.subdivide(leftChildIdx, primitives);
    this.subdivide(rightChildIdx, primitives);
  }

  private findBestSplitPlane(bvhNode: BVHNode, primitives: IBoxALike[]): BestSplit {
    let bestAxis = 0;
    let bestPlane = 0;
    let bestCost = Infinity;
    const totalPrim = bvhNode.primCount;

    [0 /* x */, 1 /* y */, 2 /* z */].forEach((axis) => {
      this.bin.forEach(b => b.reset());
      this.leftBox.reset();
      this.rightBox.reset();

      let boundsMin = Infinity;
      let boundsMax = -Infinity;

      for (let i = 0; i < totalPrim; i++) {
        const primitive = primitives[this.primitiveIndices![bvhNode.leftFirst + i]];
        const axialMidPoint = calcAxialMidPoint(primitive, axis);

        boundsMin = Math.min(boundsMin, axialMidPoint);
        boundsMax = Math.max(boundsMax, axialMidPoint);
      }

      if (boundsMax === boundsMin) {
        return;
      }
  
      const rBinWidth = this.binCnt / (boundsMax - boundsMin);
      for (let i = 0; i < totalPrim; i++) {
        const primitive = primitives[this.primitiveIndices![bvhNode.leftFirst + i]];
        const axialMidPoint = calcAxialMidPoint(primitive, axis);
        const binIdx = Math.min(
          this.lastBinIdx,
          Math.floor((axialMidPoint - boundsMin) * rBinWidth)
        );
        this.bin[binIdx].primCount++;
        this.bin[binIdx].bounds.grow(primitive);
      }

      let leftSum = 0;
      let rightSum = 0;
      for (let i = 0; i < this.lastBinIdx; i++) {
        leftSum += this.bin[i].primCount;
        this.leftCount[i] = leftSum;
        this.leftBox.grow(this.bin[i].bounds);
        this.leftArea[i] = this.leftBox.area();
        rightSum += this.bin[this.lastBinIdx - i].primCount;
        this.rightCount[this.lastBinIdx - 1 - i] = rightSum;
        this.rightBox.grow(this.bin[this.lastBinIdx - i].bounds);
        this.rightArea[this.lastBinIdx - 1 - i] = this.rightBox.area();
      }
  
      const binWidth = (boundsMax - boundsMin) / this.binCnt;
      for (let i = 0; i < this.lastBinIdx; i++) {
        const cost = this.leftCount[i] * this.leftArea[i] + this.rightCount[i] * this.rightArea[i];

        if (cost < bestCost) {
          bestPlane = boundsMin + binWidth * (i + 1);
          bestAxis = axis;
          bestCost = cost;
        }
      }
    })
  
    return {
      axis: bestAxis,
      splitPlane: bestPlane,
      splitCost: bestCost,
    };
  }

  private calculateNodeCost(bvhNode: BVHNode): number {
    const area = surfaceArea(bvhNode);

    return bvhNode.primCount * area;
  }

  private swap(a: number, b: number, arr: number[]): void {
    [arr[a], arr[b]] = [arr[b], arr[a]];
  }

  public search(target: IBoxALike): number[] {
    const result: number[] = [];

    if (!this.bvhNodes?.length) {
      return result;
    }

    return search(target, {
      bvhNodes: this.bvhNodes,
      primitiveIndices: this.primitiveIndices
    });
  }
}
