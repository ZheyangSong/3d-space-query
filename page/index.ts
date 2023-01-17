import { NativeEngine, Engine } from "../dist/esm";

const rootElem = document.getElementById("root");
rootElem!.innerHTML = "Engine is Loaded: ";

// Prepare testing data --- START
const primitiveCnt = 5_000;
const primitives = genObjs(
  [-1000, -1000, -1000],
  [1000, 1000, 1000],
  [30, 20, 50],
  primitiveCnt
);

const objCnt = 30000;
const objToCheck = genObjs(
  [-1000, -1000, -1000],
  [1000, 1000, 1000],
  [40, 20, 30],
  objCnt
);
// Prepare testing data --- END

// Load native engine (WASMM implementation)
const nativeEngine = new NativeEngine(true);

const p = new Promise<typeof nativeEngine>((res) => {
  checkReadiness(nativeEngine, res);
});

p.then((engine) => {
  rootElem!.innerHTML += engine.isReady;

  const nativeEngineBvhBuildTimingTag = `NE -- build bvh (via native) ${primitives.length}`;
  console.time(nativeEngineBvhBuildTimingTag);
  engine.build(primitives);
  console.timeEnd(nativeEngineBvhBuildTimingTag);

  const nativeEngineBvhSearchTimingTag = `NE -- bvh search (via native) ${objCnt}`;
  const formatedObj = objToCheck.map(({ aabbMin, aabbMax }) => ({
    aabbMax,
    aabbMin,
  }));

  console.time(nativeEngineBvhSearchTimingTag);
  const result = engine.search(formatedObj);
  console.timeEnd(nativeEngineBvhSearchTimingTag);
  const nativeEngineSearchResult = result.map((r, i) => ({
    object: objToCheck[i],
    intersected: r,
  }));
  nativeEngineSearchResult.forEach((tgt) =>
    tgt.intersected.sort((a, b) => a - b)
  );

  const nativeEngineJSBvhSearchTimingTag = `NE -- bvh search (via JS) ${objCnt}`;
  const nativeEngineJSSearchResult = objToCheck.map((obj) => ({
    object: obj,
    intersected: [] as any[],
  }));

  console.time(nativeEngineJSBvhSearchTimingTag);
  nativeEngineJSSearchResult.forEach(
    (tgt) => (tgt.intersected = engine.plainSearch(tgt.object))
  );
  console.timeEnd(nativeEngineJSBvhSearchTimingTag);
  nativeEngineJSSearchResult.forEach((tgt) =>
    tgt.intersected.sort((a, b) => a - b)
  );

  const engineBvhBuildTimingTag = `JS --- build bvh (via JS) ${primitives.length}`;
  const jsEngine = new Engine();

  console.time(engineBvhBuildTimingTag);
  jsEngine.build(primitives);
  console.timeEnd(engineBvhBuildTimingTag);

  const targetsForEngine = objToCheck.map((obj) => ({
    object: obj,
    intersected: [] as any[],
  }));
  const engineBvhSearchTimingTag = `JS --- bvh search (via JS) ${objCnt}`;
  console.time(engineBvhSearchTimingTag);
  targetsForEngine.forEach(
    (tgt) => (tgt.intersected = engine.search(tgt.object))
  );
  console.timeEnd(engineBvhSearchTimingTag);
  targetsForEngine.forEach((tgt) => tgt.intersected.sort((a, b) => a - b));

  let noIssue = true;
  for (let i = 0; i < objCnt; i++) {
    const t = nativeEngineJSSearchResult[i].intersected;
    const b = targetsForEngine[i].intersected;

    if (t.length !== b.length) {
      console.log(
        "found issue",
        i,
        nativeEngineJSSearchResult,
        targetsForEngine
      );
      noIssue = false;
      break;
    } else if (!t.every((v, vi) => v === b[vi])) {
      console.log(
        "found issue",
        i,
        nativeEngineJSSearchResult,
        targetsForEngine
      );
      noIssue = false;
      break;
    }
  }

  console.log(`done ${noIssue ? "success" : "failure"}`);

  if (!noIssue) {
    console.log(nativeEngine.searchTree);
    console.log({
      bvhNodes: jsEngine.bvhNodes,
      primitiveIndices: jsEngine.primitiveIndices,
    });
  }
});

function checkReadiness(
  nativeEngine: NativeEngine,
  res: (nativeEngine: NativeEngine) => void
) {
  if (!nativeEngine.isReady) {
    setTimeout(() => {
      console.log("checking...");

      checkReadiness(nativeEngine, res);
    }, 1000);
  } else {
    res(nativeEngine);
  }
}

function genObjs(
  [minX, minY, minZ]: number[],
  [maxX, maxY, maxZ]: number[],
  [maxL, maxW, maxH]: number[],
  count: number
) {
  const result: any[] = [];

  for (let i = 0; i < count; i++) {
    const aabbMin = [
      Math.min(Math.random() * (maxX - minX + 1) + minX, maxX - maxL),
      Math.min(Math.random() * (maxY - minY + 1) + minY, maxY - maxW),
      Math.min(Math.random() * (maxZ - minZ + 1) + minZ, maxZ - maxH),
    ];
    const aabbMax = [
      Math.min(Math.random() * (maxL + 1) + aabbMin[0], maxX),
      Math.min(Math.random() * (maxW + 1) + aabbMin[1], maxY),
      Math.min(Math.random() * (maxH + 1) + aabbMin[2], maxZ),
    ];

    result.push({
      aabbMin,
      aabbMax,
      centroid: [
        (aabbMax[0] - aabbMin[0]) / 2 + aabbMin[0],
        (aabbMax[1] - aabbMin[1]) / 2 + aabbMin[1],
        (aabbMax[2] - aabbMin[2]) / 2 + aabbMin[2],
      ],
    });
  }

  return result;
}
