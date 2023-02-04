import { Lib } from "./native/assembly_module/wasm-core.js";

type TP = {
  i8: Int8Array;
  i16: Int16Array;
  i32: Int32Array;
  u8: Uint8Array;
  u16: Uint16Array;
  u32: Uint32Array;
  f32: Float32Array;
  f64: Float64Array;
};

type TDataType = keyof TP;

type TK<F extends TDataType> = TP[F];

export class MemoryAllocator {
  private allocated: MemoryAllocator.Memory[] = [];

  constructor(private kernel: Lib) {}

  public allocateMemory<T extends TDataType>(count: number, type: T) {
    const mem = new MemoryAllocator.Memory(this.kernel, type, count);

    this.allocated.push(mem);

    return mem;
  }

  public reclaimAllAllocated() {
    this.allocated.forEach((m) => m.reclaim());
  }
}

export namespace MemoryAllocator {
  export class Memory<T extends TDataType = any> {
    private bufferHandle: number;
    private _dataPtr: number;
    private HeapView: ReturnType<typeof getHeapView>;

    constructor(private kernel: Lib, private type: T, private _count: number) {
      this.bufferHandle = this.kernel._malloc(_count * getDataUnitSize(type));
      this._dataPtr = getTypedPointer(this.bufferHandle, type);
      this.HeapView = getHeapView(type);
    }

    get size() {
      return this._count * getDataUnitSize(this.type);
    }

    get count() {
      return this._count;
    }

    get bufferPtr() {
      return this.bufferHandle;
    }

    get dataPtr() {
      return this._dataPtr;
    }

    get buffer() {
      return this.kernel.HEAP8.buffer.slice(
        this.bufferHandle,
        this.bufferHandle + this.size
      );
    }

    get data(): TK<T> {
      return this.kernel[this.HeapView].subarray(
        this.dataPtr,
        this.dataPtr + this.count
      ) as TK<T>;
    }

    set data(arr: TK<T>) {
      this.kernel[this.HeapView].set(arr, this.dataPtr);
    }

    public reclaim() {
      this.kernel._free(this.bufferHandle);
      this.kernel = null;
    }
  }
}

function getDataUnitSize(type: TDataType) {
  switch (type) {
    case "i8":
    case "u8":
      return Int8Array.BYTES_PER_ELEMENT;
    case "i16":
    case "u16":
      return Int16Array.BYTES_PER_ELEMENT;
    case "i32":
    case "u32":
    case "f32":
      return Int32Array.BYTES_PER_ELEMENT;
    case "f64":
      return Float64Array.BYTES_PER_ELEMENT;
  }
}

function getTypedPointer(bufferHandle: number, type: TDataType) {
  switch (type) {
    case "i8":
    case "u8":
      return bufferHandle;
    case "i16":
    case "u16":
      return bufferHandle >> 1;
    case "i32":
    case "u32":
    case "f32":
      return bufferHandle >> 2;
    case "f64":
      return bufferHandle >> 3;
  }
}

function getHeapView(type: TDataType) {
  switch (type) {
    case "i8":
      return "HEAP8";
    case "u8":
      return "HEAPU8";
    case "i16":
      return "HEAP16";
    case "u16":
      return "HEAPU16";
    case "i32":
      return "HEAP32";
    case "u32":
      return "HEAPU32";
    case "f32":
      return "HEAPF32";
    case "f64":
      return "HEAPF64";
  }
}
