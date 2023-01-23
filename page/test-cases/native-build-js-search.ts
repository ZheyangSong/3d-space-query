import { defineTest, createEngine } from "../test-utils/define-test";
import { getTimeMeasurer } from "../../utils";

export const nativeBuildAndJsSearchTitle = "native build + JS search";
export const nativeBuildAndJsSearchTestPkg = defineTest(
  nativeBuildAndJsSearchTitle,
  (primitives, objToCheck) =>
    createEngine(true).then((engine) => {
      const timeMeasurer = getTimeMeasurer({
        "build time": 0,
        "search time": 0,
      });

      timeMeasurer.measure("build time", () => engine.build(primitives));

      const nativeEngineJSSearchResult = objToCheck.map((obj) => ({
        object: obj,
        intersected: [] as number[],
      }));
      timeMeasurer.measure("search time", () => {
        nativeEngineJSSearchResult.forEach(
          (tgt) => (tgt.intersected = engine.externalSearch(tgt.object))
        );
      });
      nativeEngineJSSearchResult.forEach((tgt) =>
        tgt.intersected.sort((a, b) => a - b)
      );

      return [nativeEngineJSSearchResult, timeMeasurer.getMeasures()];
    })
);
