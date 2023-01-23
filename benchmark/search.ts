import { suite, add, configure, save } from "benny";
import { Engine, NativeEngine } from "../src";
import { IBoxALike } from "../src/js";
import { genTestData } from "../__tests__/utils";
import pkgCng from "../package.json";

const primitiveCnt = [10, 100, 1000, 5000, 10000, 30000, 50000];
const testData = primitiveCnt.map((pCnt) => genTestData(pCnt, 1).primitives);
const tgtCnt = [1, 10, 100, 1000, 10000, 30000, 70000, 100000];
const tgtData = tgtCnt.map((tCnt) => genTestData(1, tCnt).targets);

const jsEngineCases = (primitives: IBoxALike[]) =>
  tgtData.map((targets) =>
    add(
      `js engine search ${targets.length} targets in ${primitives.length} primitives`,
      () => {
        const jsEngine = new Engine();
        jsEngine.build(primitives);

        return () => {
          targets.forEach((tgt) => jsEngine.search(tgt));
        };
      }
    )
  );

const wasmEngineCases = (primitives: IBoxALike[]) =>
  tgtData.map((targets) =>
    add(
      `wasm engine search ${targets.length} targets in ${primitives.length} primitives`,
      async () => {
        const wasmEngine = new NativeEngine();
        await new Promise((resolve) =>
          wasmEngine.onReady(() => {
            resolve(true);
          })
        );
        wasmEngine.build(primitives);

        return () => {
          wasmEngine.search(targets);
        };
      }
    )
  );

export const searchBenchmarking = testData.reduce((suites, primitives) => {
  suites[`p${primitives.length}`] = () =>
    suite(
      "search",
      ...jsEngineCases(primitives),
      ...wasmEngineCases(primitives),
      configure({
        cases: {
          maxTime: 120,
        },
        minDisplayPrecision: 2,
      }),
      save({
        file: `search-in-${primitives.length}-primitives-${pkgCng.version}.benchmark`,
        folder: "benchmark/results",
        version: pkgCng.version,
        format: "chart.html",
      })
    );
  return suites;
}, {} as Record<string, () => ReturnType<typeof suite>>);
