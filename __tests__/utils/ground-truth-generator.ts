import { IPrimitive, IBoxALike } from '../../src/js';
import { intersectAABB } from '../../src/js/utils';

export function genGroundTruth(primitives: IPrimitive[], targets: IBoxALike[]) {
  const start = performance.now();
  const result = brutalForceSearch(primitives, targets);
  const executionTime = performance.now() - start;

  return {
    result,
    executionTime,
  };
}

function brutalForceSearch(primitives: IPrimitive[], targets: IBoxALike[]) {
  const result: number[][] = [];
  const primitiveCnt = primitives.length;

  for (const target of targets) {
    const currResult: number[] = [];

    for (let i = 0; i < primitiveCnt; i++) {
      const primitive = primitives[i];

      if (intersectAABB(target, primitive.aabbMin, primitive.aabbMax)) {
        currResult.push(i);
      }
    }

    result.push(currResult);
  }

  return result;
}
