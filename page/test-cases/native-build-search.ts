import { defineTest, createEngine } from "../test-utils/define-test";
import { getTimeMeasurer } from "../../utils";

export const nativeBuildAndSearchTitle = "native build + native search";
export const nativeBuildAndSearchTestPkg = defineTest(
  nativeBuildAndSearchTitle,
  (primitives, objToCheck) =>
    createEngine().then((engine) => {
      const timeMeasurer = getTimeMeasurer({
        "build time": 0,
        "search time": 0,
      });

      timeMeasurer.measure("build time", () => engine.build(primitives));

      const formatedObj = objToCheck.map(({ aabbMin, aabbMax }) => ({
        aabbMax,
        aabbMin,
      }));
      const result = timeMeasurer.measure("search time", () =>
        engine.search(formatedObj)
      );
      const nativeEngineSearchResult = result.map((r, i) => ({
        object: objToCheck[i],
        intersected: r,
      }));
      nativeEngineSearchResult.forEach((tgt) =>
        tgt.intersected.sort((a, b) => a - b)
      );

      return [nativeEngineSearchResult, timeMeasurer.getMeasures()];
    })
);
