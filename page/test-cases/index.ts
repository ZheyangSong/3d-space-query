import { runTest } from "../test-utils/run-test";
import { groundTruthTitle } from "./groundtruth";
import { jsBuildAndSearchTitle } from "./js-build-search";
import { nativeBuildAndJsSearchTitle } from "./native-build-js-search";
import { nativeBuildAndSearchTitle } from "./native-build-search";

export const execGroundTruthTest = runTest(groundTruthTitle);
export const execJsBuildAndSearchTest = runTest(jsBuildAndSearchTitle);
export const execNativeBuildAndJsSearchTest = runTest(
  nativeBuildAndJsSearchTitle
);
export const execNativeBuildAndSearchTest = runTest(nativeBuildAndSearchTitle);
