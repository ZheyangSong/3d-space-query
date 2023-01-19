import { Engine } from "../dist/esm";
import { defineTest, createEngine, getTimeMeasurer } from "./test-utils";
import { intersectAABB } from "../src/js/utils";

export const nativeBuildAndSearch = defineTest(
  "native build + native search",
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

export const nativeBuildAndJsSearch = defineTest(
  "native build + JS search",
  (primitives, objToCheck) =>
    createEngine(true).then((engine) => {
      const timeMeasurer = getTimeMeasurer({
        "search time": 0,
      });

      engine.build(primitives);

      const nativeEngineJSSearchResult = objToCheck.map((obj) => ({
        object: obj,
        intersected: [] as any[],
      }));
      timeMeasurer.measure("search time", () => {
        nativeEngineJSSearchResult.forEach(
          (tgt) => (tgt.intersected = engine.plainSearch(tgt.object))
        );
      });
      nativeEngineJSSearchResult.forEach((tgt) =>
        tgt.intersected.sort((a, b) => a - b)
      );

      return [nativeEngineJSSearchResult, timeMeasurer.getMeasures()];
    })
);

export const nativeMemDirectBuildAndSearch = defineTest(
  "native mem-direct build + search",
  (primitives, objToCheck) =>
    createEngine().then((engine) => {
      const timeMeasurer = getTimeMeasurer({
        "build time": 0,
        "search time": 0,
      });

      timeMeasurer.measure("build time", () => engine.fasterBuild(primitives));

      console.log(engine.fasterSearchTree);

      const formatedObj = objToCheck.map(({ aabbMin, aabbMax }) => ({
        aabbMax,
        aabbMin,
      }));
      const result = timeMeasurer.measure("search time", () =>
        engine.fasterSearch(formatedObj)
      );
      console.log("result faster", result);

      const nativeEngineFasterSearchResult = result.map((r, i) => ({
        object: objToCheck[i],
        intersected: r,
      }));
      nativeEngineFasterSearchResult.forEach((tgt) =>
        tgt.intersected.sort((a, b) => a - b)
      );

      return [
        nativeEngineFasterSearchResult as any,
        timeMeasurer.getMeasures(),
      ];
    })
);

export const jsBuildAndSearch = defineTest(
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
        intersected: [] as any[],
      }));

      timeMeasurer.measure("search time", () => {
        targetsForEngine.forEach(
          (tgt) => (tgt.intersected = engine.search(tgt.object as any))
        );
      });
      targetsForEngine.forEach((tgt) => tgt.intersected.sort((a, b) => a - b));

      res([targetsForEngine, timeMeasurer.getMeasures()]);
    })
);

export const groundTruth = defineTest(
  "ground truth",
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
