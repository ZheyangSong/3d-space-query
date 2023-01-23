import { TTget, TTestStatusElement, IResult } from "../utils";

export function runTest(
  title: string,
  summaryComposer: typeof defaultSummaryComposer = defaultSummaryComposer
) {
  return function ({
    primitives,
    targets,
    e,
    execTimeLimit = 5 * 60 * 1000,
    gt = Promise.resolve(),
  }: {
    primitives: TTget[];
    targets: TTget[];
    e: TTestStatusElement;
    execTimeLimit?: number;
    gt?: Promise<IResult[] | void>;
  }) {
    let worker = new Worker(new URL("./test-runner.ts", import.meta.url));

    worker.postMessage({
      testName: title,
      primitives,
      targets,
    });

    let statusElement: Element;
    let resolver: any;
    statusElement = e.addTestStatus(summaryComposer(title, {}));
    let statusObj: IStatusObj = {
      completed: false,
      startingTime: Date.now(),
      execTimeLimit,
      statusUpdate: (elapsed) => {
        statusElement.innerHTML = summaryComposer(title, elapsed);

        if (elapsed === Infinity) {
          this.completed = true;
          worker.terminate();
          resolver([]);
        }
      },
    };

    ensureTimeLimit(statusObj);

    return new Promise<[IResult[], Record<string, number>]>((resolve) => {
      resolver = resolve;
      worker.onmessage = ({ data }) => {
        resolve(data);
        worker.terminate();
      };
    })
      .then(([testResult, timing]) => {
        statusObj.completed = true;
        statusElement.innerHTML = summaryComposer(title, timing);

        return gt.then((groundTruth) => {
          if (groundTruth) {
            const unmatched = verifyWithGroundTruth(
              title,
              testResult,
              groundTruth
            );
            const passed = unmatched.length === 0;

            statusElement.innerHTML = summaryComposer(title, timing, passed);
          }

          return testResult;
        });
      })
      .catch((reason) => {
        const errMsg = [`test: ${title} <br />`, `exception: ${reason}`].join(
          "<br />"
        );

        statusElement.innerHTML = errMsg;

        return [];
      })
      .finally(() => {
        (worker as unknown) = null;
        (statusElement as unknown) = null;
        resolver = null;
        (statusObj as unknown) = null;
      });
  };
}

function defaultSummaryComposer(
  title: string,
  timing: Record<string, number> | number,
  passed?: boolean
) {
  const timeData = typeof timing === "number" ? timing : Object.entries(timing);

  const content = [
    `test: ${title} <br />`,
    ...(isTimingObj(timeData) && timeData.length
      ? timeData.map((e) => e.join(": ") + "ms")
      : [
          ["status: evaluating...", timeData ? `(${timeData}ms)` : ""].join(""),
        ]),
    `match ground truth: ${
      passed === undefined
        ? "N/A"
        : `${passed} ${!passed ? "(see details in console)" : ""}`
    }`,
  ].join("<br />");

  return content;
}

function isTimingObj(v: [string, number][] | number): v is [string, number][] {
  return typeof v !== "number";
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

interface IStatusObj {
  completed: boolean;
  startingTime: number;
  execTimeLimit: number;
  statusUpdate: (elapsedTime: number) => void;
}

function ensureTimeLimit(statusObj: IStatusObj) {
  if (!statusObj.completed) {
    const timeElapsed = Date.now() - statusObj.startingTime;

    if (timeElapsed < statusObj.execTimeLimit) {
      statusObj.statusUpdate(timeElapsed);

      requestAnimationFrame(() => {
        ensureTimeLimit(statusObj);
      });
    } else {
      statusObj.statusUpdate(Infinity);
    }
  }
}
