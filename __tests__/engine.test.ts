import { describe, it, expect, beforeAll } from '@jest/globals';
import { genGroundTruth, genTestData } from './utils';
import { Engine } from '../src';

let groundTruth: ReturnType<typeof genGroundTruth>;
let testData: ReturnType<typeof genTestData>;
const primitiveCnt = 1_000;
const targetCnt = 30_000;

beforeAll(() => {
  testData = genTestData(primitiveCnt, targetCnt);
  groundTruth = genGroundTruth(testData.primitives, testData.targets);
});

describe(`correctness & timing (${primitiveCnt} primitives, ${targetCnt} search targets)`, () => {
  const execTime = {
    singleThreadedJS: {
      build: Infinity,
      search: Infinity,
    },
    singleThreadedWASM: {
      build: Infinity,
      search: Infinity,
    },
    multiThreadedJS: {
      build: Infinity,
      search: Infinity,
    },
    multiThreadedWASM: {
      build: Infinity,
      search: Infinity,
    },
  };

  describe('single threaded JS', () => {
    const e = new Engine();
    const result: number[][] = [];

    beforeAll(() => {
      let start = performance.now();
      e.build(testData.primitives);
      execTime.singleThreadedJS.build = performance.now() - start;
  
      start = performance.now();
      for (const tgt of testData.targets) {
        result.push(e.search(tgt));
      }
      execTime.singleThreadedJS.search = performance.now() - start;
  
      result.forEach(r => r.sort((a, b) => a - b));
    });

    it('produce correct output', () => {
      for (let i = 0, end = testData.targets.length; i < end; i++) {
        expect(result[i]).toEqual(groundTruth.result[i]);
      }
    });

    it('runs faster than brutal force approach', () => {
      const { build, search } = execTime.singleThreadedJS;

      expect(build + search).toBeLessThan(groundTruth.executionTime);
    });
  });
});
