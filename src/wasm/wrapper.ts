import WasmLoader, { Lib } from "./native/assembly_module/wasm-core.js";
import { IBoxALike } from "../js/types";
import { search, ISearchTree } from "../js/searcher";
import { MemoryAllocator } from "./memory-allocator";

export class NativeEngine {
  private static kernel: Lib;
  private static memAllocator: MemoryAllocator;
  private static loadingInitialized = false;
  // node layout
  // aabbmin (3f) | aabbmax(3f) | leftfirst (ui) | primCnt (ui)
  // if this was to be promoted to double with full accuracy, be mindful with the endianness (ref: // https://webassembly.org/docs/portability/)
  private static TREE_NODE_SIZE =
    (3 + 3) * Float32Array.BYTES_PER_ELEMENT +
    (1 + 1) * Uint32Array.BYTES_PER_ELEMENT;
  // layout:
  // aabbmin (3f) | aabbmax(3f)
  private static PRIMITIVE_OBJ_SIZE = (3 + 3) * Float32Array.BYTES_PER_ELEMENT;
  private static prematuredInstances: NativeEngine[] = [];

  private _readyCallback: (engine: NativeEngine) => void;
  private _searchTree?: ISearchTree;
  private _treeMem: MemoryAllocator.Memory<"u8">;
  private _indicesMem: MemoryAllocator.Memory<"u32">;

  constructor(private exposeSearchTree = false) {
    if (!NativeEngine.loadingInitialized) {
      WasmLoader().then((lib) => {
        NativeEngine.kernel = lib;
        NativeEngine.memAllocator = new MemoryAllocator(lib);

        NativeEngine.prematuredInstances.forEach((instance) => {
          if (instance._readyCallback) {
            instance._readyCallback(instance);

            instance._readyCallback = null;
          }
        });

        NativeEngine.prematuredInstances = [];
        NativeEngine.loadingInitialized = true;
      });
    }

    if (!NativeEngine.kernel) {
      NativeEngine.prematuredInstances.push(this);
    }
  }

  public get isReady() {
    return !!NativeEngine.kernel;
  }

  public onReady(cb: typeof this._readyCallback) {
    if (this.isReady) {
      cb(this);
    } else {
      this._readyCallback = cb;
    }
  }

  public build(primitives: IBoxALike[]) {
    if (!this.isReady || !primitives.length) {
      return false;
    }

    // recycle previously allocated memory
    this._treeMem && (this._treeMem.reclaim(), (this._treeMem = null));
    this._indicesMem && (this._indicesMem.reclaim(), (this._indicesMem = null));

    const primitiveCnt = primitives.length;
    const typedArray = this.castToPrimitiveF32Arr(primitives);
    const primitiveMem = NativeEngine.memAllocator.allocateMemory(
      typedArray.length,
      "f32"
    );
    primitiveMem.data = typedArray;

    const treeNodeTotal = primitiveCnt * 2 - 1;
    const treeMemByteLength = treeNodeTotal * NativeEngine.TREE_NODE_SIZE;
    this._treeMem = NativeEngine.memAllocator.allocateMemory(
      treeMemByteLength,
      "u8"
    );
    this._indicesMem = NativeEngine.memAllocator.allocateMemory(
      primitiveCnt,
      "u32"
    );

    NativeEngine.kernel.ccall(
      "build",
      null,
      ["number", "number", "number", "number"],
      [
        primitiveMem.bufferPtr,
        primitiveCnt,
        this._indicesMem.bufferPtr,
        this._treeMem.bufferPtr,
      ]
    );

    primitiveMem.reclaim();

    if (this.exposeSearchTree && this._searchTree) {
      this._searchTree = null;
    }

    return true;
  }

  private castToPrimitiveF32Arr(primitives: IBoxALike[]) {
    const primitiveCnt = primitives.length;
    const total = primitiveCnt * 6;
    const converted = new Float32Array(total);

    for (let i = 0; i < primitiveCnt; i++) {
      const cIdx = i * 6;

      converted[cIdx] = primitives[i].aabbMin[0];
      converted[cIdx + 1] = primitives[i].aabbMin[1];
      converted[cIdx + 2] = primitives[i].aabbMin[2];
      converted[cIdx + 3] = primitives[i].aabbMax[0];
      converted[cIdx + 4] = primitives[i].aabbMax[1];
      converted[cIdx + 5] = primitives[i].aabbMax[2];
    }

    return converted;
  }

  public get searchTree() {
    if (this.exposeSearchTree && !this._searchTree) {
      this._searchTree = {
        bvhNodes: [],
        primitiveIndices: [],
      };

      const treeMemPtr = this._treeMem.bufferPtr;
      for (
        let i = 0, end = this._treeMem.size;
        i < end;
        i += NativeEngine.TREE_NODE_SIZE
      ) {
        const basePtr = (treeMemPtr + i) >> 2;
        const floatSlice = NativeEngine.kernel.HEAPF32.subarray(
          basePtr,
          basePtr + 6
        );
        const intSlice = NativeEngine.kernel.HEAPU32.subarray(
          basePtr + 6,
          basePtr + 8
        );

        this._searchTree.bvhNodes.push({
          aabbMin: [floatSlice[0], floatSlice[1], floatSlice[2]],
          aabbMax: [floatSlice[3], floatSlice[4], floatSlice[5]],
          leftFirst: intSlice[0],
          primCount: intSlice[1],
        });
      }

      // @ts-ignore
      this._searchTree.primitiveIndices = [...this._indicesMem.data];
    }

    return this._searchTree;
  }

  public externalSearch(targets: IBoxALike[]): number[][];
  public externalSearch(target: IBoxALike): number[];
  public externalSearch(args: IBoxALike | IBoxALike[]) {
    if (Array.isArray(args)) {
      const results: number[][] = [];

      args.forEach((t) => results.push(search(t, this.searchTree)));

      return results;
    } else {
      return search(args, this.searchTree);
    }
  }

  public search(targets: IBoxALike[]): (Uint32Array | number[])[] {
    if (!targets.length || !this._treeMem?.size) {
      return [];
    }

    const res: (Uint32Array | number[])[] = [];
    const tgtTotal = targets.length;
    const resultMem = NativeEngine.memAllocator.allocateMemory(
      this._indicesMem.count,
      "u32"
    );
    const resultRangeData = resultMem.data;

    for (let i = 0; i < tgtTotal; i++) {
      const tgt = targets[i];
      const input = new Float32Array([
        ...(tgt.aabbMin as number[]),
        ...(tgt.aabbMax as number[]),
      ]);

      const found = NativeEngine.kernel.ccall(
        "search",
        "number",
        ["array", "number", "number", "number"],
        [
          new Uint8Array(input.buffer),
          this._indicesMem.bufferPtr,
          this._treeMem.bufferPtr,
          resultMem.bufferPtr,
        ]
      );

      if (found) {
        res.push(resultRangeData.slice(0, found));
      } else {
        res.push([]);
      }
    }

    return res;
  }
}
