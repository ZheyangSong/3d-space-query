export type TTget = ReturnType<typeof genObjs>[0];

export interface IResult {
  object: TTget,
  intersected: number[],
}

export function genObjs(
  [minX, minY, minZ]: number[],
  [maxX, maxY, maxZ]: number[],
  [maxL, maxW, maxH]: number[],
  count: number
) {
  const result: {aabbMin: number[]; aabbMax: number[]; centroid: number[];}[] = [];

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

export type TTestSpecElement = HTMLDivElement & { addTestSpec(spec: string): void; };

export type TTestStatusElement = HTMLDivElement & { addTestStatus(status: string): void; };
