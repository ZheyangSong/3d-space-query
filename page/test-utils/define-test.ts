import { TTget, IResult } from "../utils";
import { NativeEngine } from "../../dist/esm";

export function defineTest<
  T extends (
    primitives: TTget[],
    targets: TTget[]
  ) => Promise<[IResult[], Record<string, number>]>
>(title: string, test: T) {
  return {
    name: title,
    test,
  };
}

// Load native engine (WASM implementation)
export function createEngine(keepSearchTree?: boolean) {
  return new Promise<NativeEngine>((res) => {
    checkReadiness(new NativeEngine(keepSearchTree), res);
  });
}

function checkReadiness(
  nativeEngine: NativeEngine,
  res: (nativeEngine: NativeEngine) => void
) {
  // nativeEngineReadinessElem.innerHTML += nativeEngine.isReady;

  if (!nativeEngine.isReady) {
    setTimeout(() => {
      checkReadiness(nativeEngine, res);
    }, 1000);
  } else {
    res(nativeEngine);
  }
}
