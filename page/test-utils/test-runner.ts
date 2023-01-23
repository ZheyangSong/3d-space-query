import { groundTruthTestPkg } from "../test-cases/groundtruth";
import { jsBuildAndSearchTestPkg } from "../test-cases/js-build-search";
import { nativeBuildAndJsSearchTestPkg } from "../test-cases/native-build-js-search";
import { nativeBuildAndSearchTestPkg } from "../test-cases/native-build-search";

const tests = {
  [groundTruthTestPkg.name]: groundTruthTestPkg.test,
  [jsBuildAndSearchTestPkg.name]: jsBuildAndSearchTestPkg.test,
  [nativeBuildAndJsSearchTestPkg.name]: nativeBuildAndJsSearchTestPkg.test,
  [nativeBuildAndSearchTestPkg.name]: nativeBuildAndSearchTestPkg.test,
};

self.onmessage = ({ data }: MessageEvent) => {
  const { testName, primitives, targets } = data;

  const test = tests[testName];

  if (test) {
    test(primitives, targets).then((outcome) => {
      self.postMessage(outcome);
    });
  } else {
    self.postMessage([]);
  }
};
