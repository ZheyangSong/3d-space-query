import { suite, add, configure, save } from "benny";
import { Engine, NativeEngine } from "../src";
import { genTestData } from "../__tests__/utils";
import pkgCng from "../package.json";

const primitiveCnt = [100, 1000, 5000, 10000, 30000, 50000];
const testData = primitiveCnt.map((pCnt) => genTestData(pCnt, 1));

const jsEngineCases = testData.map(({ primitives }, i) =>
  add(`js engine build ${primitiveCnt[i]} primitives`, () => {
    const jsEngine = new Engine();
    return () => {
      jsEngine.build(primitives);
    };
  })
);

const wasmEngineCases = testData.map(({ primitives }, i) =>
  add(`wasm engine build ${primitiveCnt[i]} primitives`, async () => {
    const wasmEngine = new NativeEngine();
    await new Promise((resolve) =>
      wasmEngine.onReady(() => {
        resolve(true);
      })
    );

    return () => {
      wasmEngine.build(primitives);
    };
  })
);

export const buildBenchmarking = () =>
  suite(
    "build",
    ...jsEngineCases,
    ...wasmEngineCases,
    configure({
      cases: {
        maxTime: 120,
      },
      minDisplayPrecision: 2,
    }),
    save({
      file: `build-${pkgCng.version}.benchmark`,
      folder: "benchmark/results",
      version: pkgCng.version,
      format: "chart.html",
    })
  );
