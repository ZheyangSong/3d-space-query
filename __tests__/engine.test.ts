import { describe, it, expect, beforeAll } from '@jest/globals';
import { genGroundTruth, genTestData } from './utils';
import { Engine, NativeEngine } from '../src';
import { getTimeMeasurer } from '../utils';

let groundTruth: ReturnType<typeof genGroundTruth>;
let testData: ReturnType<typeof genTestData>;
const primitiveCnt = 10_000;
const targetCnt = 50_000;

beforeAll(() => {
  testData = genTestData(primitiveCnt, targetCnt);
  groundTruth = genGroundTruth(testData.primitives, testData.targets);
});

describe(`correctness & timing (${primitiveCnt} primitives, ${targetCnt} search targets)`, () => {
  const execTime = {
    singleThreadedJS: getTimeMeasurer({
      build: Infinity,
      search: Infinity,
    }),
    singleThreadedWASM: getTimeMeasurer({
      build: Infinity,
      search: Infinity,
    }),
    multiThreadedJS: getTimeMeasurer({
      build: Infinity,
      search: Infinity,
    }),
    multiThreadedWASM: getTimeMeasurer({
      build: Infinity,
      search: Infinity,
    }),
  };

  describe('single threaded JS', () => {
    const e = new Engine();
    const result: number[][] = [];

    beforeAll(() => {
      execTime.singleThreadedJS.measure('build', () => e.build(testData.primitives));

      execTime.singleThreadedJS.measure('search', () => {
        for (const tgt of testData.targets) {
          result.push(e.search(tgt));
        }
      });

      result.forEach(r => r.sort((a, b) => a - b));
    });

    it('produce correct output', () => {
      for (let i = 0, end = testData.targets.length; i < end; i++) {
        expect(result[i]).toEqual(groundTruth.result[i]);
      }
    });

    it('runs faster than brutal force approach', () => {
      const { build, search } = execTime.singleThreadedJS.getMeasures();

      expect(build + search).toBeLessThan(groundTruth.executionTime);
    });
  });

  describe('single threaded WASM', () => {
    const e = new NativeEngine();
    let result: ReturnType<typeof e.search> = [];

    beforeAll(() => {
      return new Promise((resolve) => {
        e.onReady((engine) => {
          execTime.singleThreadedWASM.measure('build', () => engine.build(testData.primitives));

          result = execTime.singleThreadedWASM.measure('search', () => engine.search(testData.targets));

          result.forEach(r => r.sort((a, b) => a - b));

          resolve(true);
        });
      });
    });

    it('produce correct output', () => {
      for (let i = 0, end = testData.targets.length; i < end; i++) {
        expect([...result[i]]).toEqual(groundTruth.result[i]);
      }
    });

    it('runs faster than brutal force approach', () => {
      const { build, search } = execTime.singleThreadedWASM.getMeasures();

      expect(build + search).toBeLessThan(groundTruth.executionTime);
    });

    it('runs faster than single-threaded JS approach', () => {
      const { build, search } = execTime.singleThreadedWASM.getMeasures();
      const jsExecTime = execTime.singleThreadedJS.getMeasures();

      expect(build + search).toBeLessThan(jsExecTime.build + jsExecTime.search);
    });

    it('builds faster than single-threaded JS approach', () => {
      const { build } = execTime.singleThreadedWASM.getMeasures();

      expect(build).toBeLessThan(execTime.singleThreadedJS.getMeasures().build);
    });

    const searchSpeedPrimCnt = 30_000;
    const searchSpeedTgtCnt = 100_000;
    it(`searches faster than single-threaded JS approach when searching scale is large (${searchSpeedPrimCnt} primitives + ${searchSpeedTgtCnt} targets)`, () => {
      const searchSpeedTestData = genTestData(searchSpeedPrimCnt, searchSpeedTgtCnt);

      const jsEngine = new Engine();
      const searchTime = getTimeMeasurer({
        js: Infinity,
        wasm: Infinity,
      });

      jsEngine.build(searchSpeedTestData.primitives);
      e.build(searchSpeedTestData.primitives);

      searchTime.measure("js", () => {
        for (const tgt of searchSpeedTestData.targets) {
          result.push(jsEngine.search(tgt));
        }
      });

      searchTime.measure('wasm', () => e.search(testData.targets));

      const {js, wasm} = searchTime.getMeasures();

      expect(wasm).toBeLessThan(js);
    });
  });
});
