import { IBoxALike } from '../../src/js';
import { intersectAABB } from '../../src/js/utils';

export function genGroundTruth(primitives: IBoxALike[], targets: IBoxALike[]) {
  const start = performance.now();
  const result = brutalForceSearch(primitives, targets);
  const executionTime = performance.now() - start;

  return {
    result,
    executionTime,
  };
}

function brutalForceSearch(primitives: IBoxALike[], targets: IBoxALike[]) {
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
