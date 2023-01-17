import WasmLoader, { Lib } from './native/assembly_module/wasm-core';
import { IPrimitive, IBoxALike } from '../js/types';
import { search, ISearchTree } from './searcher';

export class NativeEngine {
  private static kernel: Lib;
  private static loadingInitialized = false;
  private static prematuredInstances: NativeEngine[] = [];
  private _engine: Lib.Engine;
  private _readyCallback: (engine: NativeEngine) => void;
  private _searchTree?: ISearchTree = {
    bvhNodes: [],
    primitiveIndices: [],
  };
  private _rawTree: Lib.BvhNodeList;

  constructor(private keepSearchTree = false) {
    if (!NativeEngine.loadingInitialized) {
      WasmLoader().then((lib: Lib) => {
        NativeEngine.kernel = lib;

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

  public get searchTree() {
    if (this.keepSearchTree && !this._searchTree) {
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
    }

    return this._searchTree;
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

  public plainSearch(target: IBoxALike): number[] {
    return search(target, this.searchTree);
  }

  public search(targets: IBoxALike[]): number[][] {
    if (!targets.length || !this._engine) {
      return [];
    }

    if (targets.length === 1) {
      const result = this._engine.searchOne(this.formatConverter(targets[0]));

      return [this.vectorToArray(result)];
    }

    const input = this.genNativeList(targets);
    const result = this._engine.searchMany(input);

    return this.vectorToArray(result).map(r => this.vectorToArray(r));
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
