import { TTestSpecElement, TTestStatusElement, genObjs } from "./utils";
import {
  groundTruth,
  jsBuildAndSearch,
  nativeBuildAndJsSearch,
  nativeBuildAndSearch,
} from "./tests";

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

const inlineStyleElem = document.createElement('style');
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
};

// Prepare testing data --- START
const primitiveCnt = 5_000;
const primitives = genObjs(
  [-1000, -1000, -1000],
  [1000, 1000, 1000],
  [30, 20, 50],
  primitiveCnt
);

const objCnt = 20_000;
const objToCheck = genObjs(
  [-1000, -1000, -1000],
  [1000, 1000, 1000],
  [40, 20, 30],
  objCnt
);
// Prepare testing data --- END

testSpecElement.addTestSpec(`primitive total: ${primitiveCnt}`);
testSpecElement.addTestSpec(`target total: ${objCnt}`);

const gt = groundTruth(primitives, objToCheck, testStatusElem);
jsBuildAndSearch(primitives, objToCheck, testStatusElem, gt);
nativeBuildAndJsSearch(primitives, objToCheck, testStatusElem, gt);
nativeBuildAndSearch(primitives, objToCheck, testStatusElem, gt);
