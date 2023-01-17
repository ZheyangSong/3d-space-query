// Need to be in sync with the interface descriptions in lib/binding.cpp

export default function WasmLoader(): Promise<Lib>;

declare interface loaderCnfg {
  locateFile?: (path: string, prefix: string) => string;
}

type Lib = {
  BvhNode: typeof Lib.BvhNode;
  PrimitiveList: typeof Lib.PrimitiveList;
  BoxList: typeof Lib.BoxList;
  IndexList: typeof Lib.IndexList;
  MultiIndexLists: typeof Lib.MultiIndexLists;
  Engine: typeof Lib.Engine;
  WasmLoader: typeof WasmLoader;
};

declare namespace Lib {
  class BvhNode {
    public aabbMin: Float3;
    public aabbMax: Float3;
    public leftFirst: number;
    public primCount: number;
    public isLeaf(): boolean;
  }
  
  class PrimitiveList extends Vector<Primitive> {}

  class BoxList extends Vector<Box> {}
  
  class IndexList extends Vector<number> {}
  
  class MultiIndexLists extends Vector<IndexList> {}
  
  class BvhNodeList extends Vector<BvhNode> {}
  
  class Engine {
    public build(aabbBoxes: PrimitiveList): BvhNodeList;
    public getOrderedPrimIndices(): IndexList;
    public searchOne(target: Box): IndexList;
    public searchMany(target: BoxList): MultiIndexLists;
  }
  
  class Vector<T> {
    public get(i: number): T;
    public push_back(item: T): void;
    public size(): number;
  }
  
  class Float3 {
    public x: number;
    public y: number;
    public z: number;
  }

  interface Box {
    aabbMin: Float3;
    aabbMax: Float3;
  }

  interface Primitive extends Box {
    centroid: Float3;
  }
}
