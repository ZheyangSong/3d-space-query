import WasmLoader, { Lib } from './native/assembly_module/wasm-core.js';
import { IPrimitive, IBoxALike } from '../js/types';
import { BVHNode } from '../js/BVHNode';
import { search, ISearchTree } from './searcher';
import { MemoryAllocator } from './memory-allocator';

export class NativeEngine {
  private static kernel: Lib;
  private static memAllocator: MemoryAllocator;
  private static loadingInitialized = false;
  // node layout
  // aabbmin (3f) | aabbmax(3f) | leftfirst (ui) | primCnt (ui)
  private static TREE_NODE_SIZE = (3 + 3) * Float32Array.BYTES_PER_ELEMENT + (1 + 1) * Uint32Array.BYTES_PER_ELEMENT;
  // layout:
  // min.x,min.y,min.z|max.x,max.y,max.z|center.x,center.y,center.z
  private static PRIMITIVE_OBJ_SIZE = (3 + 3 + 3) * Float32Array.BYTES_PER_ELEMENT;
  private static prematuredInstances: NativeEngine[] = [];
  private _engine: Lib.Engine;
  private _readyCallback: (engine: NativeEngine) => void;
  private _searchTree?: ISearchTree = {
    bvhNodes: [],
    primitiveIndices: [],
  };
  private _rawTree: Lib.BvhNodeList;
  private _treeMem: MemoryAllocator.Memory<"u8">;
  private _treeNodeTotal: number;
  private _indicesMem: MemoryAllocator.Memory<"u32">;
  private _indicesTotal: number;

  constructor(private keepSearchTree = false) {
    if (!NativeEngine.loadingInitialized) {
      WasmLoader().then((lib) => {
        NativeEngine.kernel = lib;
        NativeEngine.memAllocator = new MemoryAllocator(lib);

// console.log(Object.keys(lib), lib.HEAPF32)
        NativeEngine.prematuredInstances.forEach(instance => {
          instance._engine = new lib.Engine();
          if (instance._readyCallback) {
            instance._readyCallback(instance);

            instance._readyCallback = null;
          }
        });

        NativeEngine.prematuredInstances = [];
      });
    }

    if (NativeEngine.kernel) {
      this._engine = new NativeEngine.kernel.Engine();
    } else {
      NativeEngine.prematuredInstances.push(this);
    }
  }

  public get isReady() {
    return !!this._engine;
  }

  public set onReady(cb: typeof this._readyCallback) {
    if (this.isReady) {
      cb(this);
    } else {
      this._readyCallback = cb;
    }
  }

  public build(primitives: IPrimitive[]) {
    if (!this._engine || !primitives.length) {
      return false;
    }

    this._searchTree = null;

    const input = this.genNativeList(primitives);

    if (this.keepSearchTree) {
      this._rawTree = this._engine.build(input);
    } else {
      this._engine.build(input);
    }

    return true;
  }

  public fasterBuild(primitives: IPrimitive[]) {
    if (!this._engine || !primitives.length) {
      return false;
    }

    this._treeMem && (this._treeMem.reclaim(), this._treeMem = null);
    this._indicesMem && (this._indicesMem.reclaim(), this._indicesMem = null);


        /* test -- start */
const primitiveCnt = primitives.length;
this._indicesTotal = primitiveCnt;
        const t = `set data (${primitiveCnt} primitives) in memory`;
        console.time(t);
        const typedArray = this.castToPrimitiveF32Arr(primitives);
        const primitiveMem = NativeEngine.memAllocator.allocateMemory(typedArray.length, 'f32');
        this._indicesMem = NativeEngine.memAllocator.allocateMemory(primitiveCnt, 'u32');
        const treeNodeTotal = primitiveCnt * 2 - 1;
        const treeMemByteLength = treeNodeTotal * NativeEngine.TREE_NODE_SIZE;
        this._treeMem = NativeEngine.memAllocator.allocateMemory(treeMemByteLength, 'u8');
        primitiveMem.data = typedArray;
        NativeEngine.kernel.ccall("build", null, ["number", "number", "number", "number"], [primitiveMem.bufferPtr, primitiveCnt, this._indicesMem.bufferPtr, this._treeMem.bufferPtr]);
        console.timeEnd(t);

        // const rehydratedTree: any = [];
        // const indices: number[] = [];
        // const indicesMemData = this._indicesMem.data;
        // for (let i = 0; i < primitiveCnt; i++) {
        //   indices.push(indicesMemData[i]);
        // }

        // const treeMemData = this._treeMem.data;
        // const treeMemRawPtr = this._treeMem.bufferPtr;
        // for (let i = 0; i < treeMemByteLength; i += NativeEngine.TREE_NODE_SIZE) {
        //   const intSlice = NativeEngine.kernel.HEAPU32.subarray(treeMemRawPtr + i + 6, treeMemRawPtr + i + 8);

        //   rehydratedTree.push({
        //     aabbMin: [
        //       treeMemData[i],
        //       treeMemData[i + 1],
        //       treeMemData[i + 2],
        //     ],
        //     aabbMax: [
        //       treeMemData[i + 3],
        //       treeMemData[i + 4],
        //       treeMemData[i + 5],
        //     ],
        //     leftFirst: intSlice[0],
        //     primCnt: intSlice[1],
        //   });
        // }

        // console.log(rehydratedTree, indices);

        primitiveMem.reclaim();
              /* test -- end */
    return true;
  }

  private castToPrimitiveF32Arr(primitives: IPrimitive[]): Float32Array {
    const primitiveCnt = primitives.length;
    const arr = new Array(primitiveCnt * NativeEngine.PRIMITIVE_OBJ_SIZE);
        for (let i = 0; i < primitiveCnt; i++) {
          arr[i] = primitives[i].aabbMin[0]
          arr[i + 1] = primitives[i].aabbMin[1]
          arr[i + 2] = primitives[i].aabbMin[2]
          arr[i + 3] = primitives[i].aabbMax[0]
          arr[i + 4] = primitives[i].aabbMax[1]
          arr[i + 5] = primitives[i].aabbMax[2]
          arr[i + 6] = primitives[i].centroid[0]
          arr[i + 7] = primitives[i].centroid[1]
          arr[i + 8] = primitives[i].centroid[2]
        }

        return new Float32Array(arr);
  }

  public get searchTree() {
    if (this.keepSearchTree && !this._searchTree) {
      console.time('convert tree')
      this._searchTree = {
        bvhNodes: [],
        primitiveIndices: [],
      };

      for (let i = 0, end = this._rawTree.size(); i < end; i++) {
        const node = this._rawTree.get(i);
        this._searchTree.bvhNodes.push({
          aabbMin: this.toArray(node.aabbMin),
          aabbMax: this.toArray(node.aabbMax),
          leftFirst: node.leftFirst,
          primCount: node.primCount,
          isLeaf: node.isLeaf(),
        });
      }
      this._rawTree = null;

      const ordered = this._engine.getOrderedPrimIndices();
      this._searchTree.primitiveIndices = new Array(ordered.size()).fill(0).map((_, i) => ordered.get(i));
      console.timeEnd('convert tree')
    }

    return this._searchTree;
  }

  public get fasterSearchTree() {
    if (this._treeMem?.size) {
      console.time('convert faster tree')
      const t = {
        bvhNodes: [] as BVHNode[],
        primitiveIndices: [] as number[],
      };

      const treeMemData = this._treeMem.data;console.log(treeMemData)
      const treeMemPtr = this._treeMem.bufferPtr;
      for (let i = 0, end = this._treeMem.count; i < end; i += NativeEngine.TREE_NODE_SIZE) {
        const basePtr = (treeMemPtr + i * NativeEngine.TREE_NODE_SIZE) >> 2;
        const floatSlice = NativeEngine.kernel.HEAPF32.subarray(basePtr, basePtr + 6);
        const intSlice = NativeEngine.kernel.HEAPU32.subarray(basePtr + 6, basePtr + 8);

        t.bvhNodes.push({
          aabbMin: [
            floatSlice[0],
            floatSlice[1],
            floatSlice[2],
          ],
          aabbMax: [
            floatSlice[3],
            floatSlice[4],
            floatSlice[5],
          ],
          leftFirst: intSlice[0],
          primCount: intSlice[1],
          get isLeaf() {
            return this.primCnt > 0;
          }
        });
      }

      // @ts-ignore
      t.primitiveIndices = [...this._indicesMem.data];
      console.timeEnd('convert faster tree');
      console.log(this._indicesMem.data);

      return t;
    }
  }

  private genNativeList(data: IPrimitive[]): Lib.PrimitiveList;
  private genNativeList(data: IBoxALike[]): Lib.BoxList;
  private genNativeList(data: IPrimitive[] | IBoxALike[]) {
    if (isPrimitive(data[0])) {
      const ret = new NativeEngine.kernel.PrimitiveList();

      for (const datum of data) {
        ret.push_back(this.formatConverter(datum as IPrimitive));
      }
  
      return ret;
    } else {
      const ret = new NativeEngine.kernel.BoxList();
  
      for (const datum of data) {
        ret.push_back(this.formatConverter(datum) as Lib.Box);
      }
  
      return ret;
    }
  }

  private formatConverter(p: IPrimitive): Lib.Primitive
  private formatConverter(p: IBoxALike): Lib.Box;
  private formatConverter(p: IBoxALike | IPrimitive): Lib.Box | Lib.Primitive {
    const res = {
      aabbMin: {
        x: p.aabbMin[0],
        y: p.aabbMin[1],
        z: p.aabbMin[2],
      },
      aabbMax: {
        x: p.aabbMax[0],
        y: p.aabbMax[1],
        z: p.aabbMax[2],
      },
    };

    if (isPrimitive(p)) {
      (res as Lib.Primitive).centroid = {
        x: p.centroid[0],
        y: p.centroid[1],
        z: p.centroid[2],
      };
    }

    return res;
  }

  private toArray(p: Lib.Float3) {
    return [p.x, p.y, p.z];
  }

  public plainSearch(targets: IBoxALike[]): number[][];
  public plainSearch(target: IBoxALike): number[];
  public plainSearch(args: IBoxALike | IBoxALike[]) {

    if (Array.isArray(args)) {
      const results: number[][] = [];
      
      args.forEach(t => results.push(search(t, this.searchTree)));

      return results;
    } else {
      return search(args, this.searchTree);
    }
  }

  public search(targets: IBoxALike[]): number[][] {
    if (!targets.length || !this._engine) {
      return [];
    }

    if (targets.length === 1) {
      const result = this._engine.searchOne(this.formatConverter(targets[0]));

      return [this.vectorToArray(result)];
    }

    let input: any;
    console.time('gen input');
    input = this.genNativeList(targets);
    console.timeEnd('gen input');
    console.time('native bulk search');
    const result = this._engine.searchMany(input);
    console.timeEnd('native bulk search');

    return this.vectorToArray(result).map(r => this.vectorToArray(r));
  }

  public fasterSearch(targets: IBoxALike[]): (Uint32Array | number[])[] {
    if (!targets.length || !this._engine || !this._treeMem?.size) {
      return [];
    }

    const res: (Uint32Array | number[])[] = [];
    console.time('faster native bulk search');
    const tgtTotal = targets.length;
    const resultMem = NativeEngine.memAllocator.allocateMemory(this._indicesMem.count, 'u32');
    const resultRangeData = resultMem.data as Uint32Array;
    for (let i = 0; i < tgtTotal; i++) {
      const tgt = targets[i];
      const input = new Float32Array([...(tgt.aabbMin as number[]), ...(tgt.aabbMax as number[])]);

      const found = NativeEngine.kernel.ccall("search", "number", ["array", "number", "number", "number"], [new Uint8Array(input.buffer), this._indicesMem.bufferPtr, this._treeMem.bufferPtr, resultMem.bufferPtr]);

      if (found) {
        // const collected: number[] = [];
        // for (let i = 0; i < found; i++) {
        //   // console.log(resultRangeData[i]);
        //   collected.push(resultRangeData[i]);
        // }

        res.push(resultRangeData.slice(0, found));
      } else {
        res.push([]);
      }
    }
    console.timeEnd('faster native bulk search');

    return res;
  }

  private vectorToArray<T>(vec: Lib.Vector<T>): T[] {
    return new Array(vec.size()).fill(0).map((_, i) => vec.get(i))
  }
}

function isPrimitive(p: IPrimitive[] | IBoxALike[]): p is IPrimitive[];
function isPrimitive(p: IPrimitive | IBoxALike): p is IPrimitive;
function isPrimitive(p: any) {
  return 'centroid' in p || (p[0] && 'centroid' in p[0]);
}
