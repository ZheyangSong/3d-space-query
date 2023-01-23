import { defineTest } from "../test-utils/define-test";
import { intersectAABB } from "../../src/js/utils";
import { getTimeMeasurer } from "../../utils";

export const groundTruthTitle = "ground truth";
export const groundTruthTestPkg = defineTest(
  groundTruthTitle,
  (primitives, objToCheck) =>
    new Promise((res) => {
      const timeMeasurer = getTimeMeasurer({
        "search time": 0,
      });

      const result = objToCheck.map((obj) => ({
        object: obj,
        intersected: [] as number[],
      }));

      timeMeasurer.measure("search time", () => {
        result.forEach((tgt) => {
          primitives.forEach((primitive, idx) => {
            if (
              intersectAABB(tgt.object, primitive.aabbMin, primitive.aabbMax)
            ) {
              tgt.intersected.push(idx);
            }
          });
        });
      });

      res([result, timeMeasurer.getMeasures()]);
    })
);
