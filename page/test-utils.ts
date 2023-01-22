import { TTget, TTestStatusElement, IResult } from "./utils";
import { NativeEngine } from "../dist/esm";

export function defineTest<
  T extends (
    primitives: TTget[],
    targets: TTget[]
  ) => Promise<[IResult[], Record<string, number>]>
>(title: string, test: T) {
  return function (
    primitives: TTget[],
    targets: TTget[],
    e: TTestStatusElement,
    gt?: Promise<IResult[]>
  ) {
    return Promise.all([
      test(primitives, targets),
      gt ?? Promise.resolve(),
    ]).then(([[testResult, timing], groundTruth]) => {
      if (groundTruth) {
        const unmatched = verifyWithGroundTruth(title, testResult, groundTruth);
        const notPass = unmatched.length > 0;

        e.addTestStatus(
          [
            `test: ${title} <br />`,
            ...Object.entries(timing).map((e) => e.join(": ") + 'ms'),
            `match ground truth: ${!notPass} ${
              notPass ? "(see details in console)" : ""
            }`,
          ].join("<br />")
        );
      } else {
        e.addTestStatus(
          [
            `test: ${title}`,
            ...Object.entries(timing).map((e) => e.join(": ") + 'ms'),
          ].join("<br />")
        );
      }

      return testResult;
    }).catch((reason) => {
      e.addTestStatus([
        `test: ${title} <br />`,
        `exception: ${reason}`
      ].join('<br />'));

      return [];
    });
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

export function verifyWithGroundTruth(
  title: string,
  resultToVerify: IResult[],
  gt: IResult[]
) {
  const unmatched: number[] = [];
  resultToVerify.forEach(({ intersected }, i) => {
    const match =
      gt[i].intersected.length == intersected.length &&
      gt[i].intersected.every((itrsct, j) => itrsct === intersected[j]);

    if (!match) {
      unmatched.push(i);
    }
  });

  if (unmatched.length) {
    console.log(`${title} - mismatched: `, unmatched, {
      ne: resultToVerify,
      gt,
    });
  } else {
    console.log(`${title} - all matched`);
  }

  return unmatched;
}
