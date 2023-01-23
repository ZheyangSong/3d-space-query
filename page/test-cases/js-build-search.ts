import { Engine } from "../../dist/esm";
import { defineTest } from "../test-utils/define-test";
import { getTimeMeasurer } from "../../utils";

export const jsBuildAndSearchTitle = "JS build + search";
export const jsBuildAndSearchTestPkg = defineTest(
  "JS build + search",
  (primitives, objToCheck) =>
    new Promise((res) => {
      const timeMeasurer = getTimeMeasurer({
        "build time": 0,
        "search time": 0,
      });

      const engine = new Engine();

      timeMeasurer.measure("build time", () => engine.build(primitives));

      const targetsForEngine = objToCheck.map((obj) => ({
        object: obj,
        intersected: [] as number[],
      }));

      timeMeasurer.measure("search time", () => {
        targetsForEngine.forEach(
          (tgt) => (tgt.intersected = engine.search(tgt.object))
        );
      });
      targetsForEngine.forEach((tgt) => tgt.intersected.sort((a, b) => a - b));

      res([targetsForEngine, timeMeasurer.getMeasures()]);
    })
);
