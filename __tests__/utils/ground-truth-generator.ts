import { IBoxALike, TPoint } from '../../src/js';
import { isIntersected } from '../../src/js/utils';

type TTarget = (IBoxALike | TPoint);

export function genGroundTruth(primitives: IBoxALike[], targets: TTarget[]) {
  const start = performance.now();
  const result = brutalForceSearch(primitives, targets);
  const executionTime = performance.now() - start;

  return {
    result,
    executionTime,
  };
}

function brutalForceSearch(primitives: IBoxALike[], targets: TTarget[]) {
  const result: number[][] = [];
  const primitiveCnt = primitives.length;

  for (const target of targets) {
    const currResult: number[] = [];

    for (let i = 0; i < primitiveCnt; i++) {
      const primitive = primitives[i];

      if (isIntersected(target, primitive.aabbMin, primitive.aabbMax)) {
        currResult.push(i);
      }
    }

    result.push(currResult);
  }

  return result;
}
