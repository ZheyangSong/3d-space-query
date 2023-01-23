import { genTestData } from "../__tests__/utils";
import { TTestSpecElement, TTestStatusElement } from "./utils";
import {
  execGroundTruthTest,
  execJsBuildAndSearchTest,
  execNativeBuildAndJsSearchTest,
  execNativeBuildAndSearchTest,
} from "./test-cases";

/**
 * ----------------------------
 * summary
 * loading status
 * test spec
 * ----------------------------
 * test status
 * | test 1 | test 2 | test 3 |
 * ----------------------------
 * | test 4 | test 5 | ...
 * ----------------------------
 */

const rootElem = document.getElementById("root")!;

const inlineStyleElem = document.createElement("style");
inlineStyleElem.textContent = `
.test-status-container {
  display: flex;
  flex-wrap: wrap;
}

.test-status-container code {
  width: calc(33% - 40px);
  margin: 40px 20px;
  flex-basis: calc(33% - 40px);
  flex-shrink: 0;
}
`;
document.head.appendChild(inlineStyleElem);

const summaryElem = document.createElement("div");
rootElem.appendChild(summaryElem);

// const nativeEngineReadinessElem = document.createElement('p');
// summaryElem.appendChild(nativeEngineReadinessElem);

// nativeEngineReadinessElem.innerHTML = "Native Engine is Loaded: ";

const testSpecElement = document.createElement("div") as TTestSpecElement;
summaryElem.appendChild(testSpecElement);

testSpecElement["addTestSpec"] = function (spec: string) {
  const statusElem = document.createElement("p");
  statusElem.innerHTML = spec;
  this.appendChild(statusElem);
};

const testStatusElem = document.createElement("div") as TTestStatusElement;
rootElem.appendChild(testStatusElem);
testStatusElem.className = "test-status-container";

testStatusElem["addTestStatus"] = function (status: string) {
  const statusElem = document.createElement("code");
  statusElem.innerHTML = status;

  this.appendChild(statusElem);

  return statusElem;
};

// Prepare testing data --- START
const primitiveCnt = 10_000;
const objCnt = 30_000;
const { primitives, targets } = genTestData(primitiveCnt, objCnt);
// Prepare testing data --- END

testSpecElement.addTestSpec(`primitive total: ${primitiveCnt}`);
testSpecElement.addTestSpec(`target total: ${objCnt}`);

const gt = execGroundTruthTest({primitives, targets, e: testStatusElem});
execJsBuildAndSearchTest({primitives, targets, e: testStatusElem, gt});
execNativeBuildAndJsSearchTest({primitives, targets, e: testStatusElem, gt});
execNativeBuildAndSearchTest({primitives, targets, e: testStatusElem, gt});
