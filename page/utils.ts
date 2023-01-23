import { genObjs } from "../__tests__/utils";

export type TTget = ReturnType<typeof genObjs>[0];

export interface IResult {
  object: TTget;
  intersected: number[] | Uint32Array;
}

export type TTestSpecElement = HTMLDivElement & {
  addTestSpec(spec: string): void;
};

export type TTestStatusElement = HTMLDivElement & {
  addTestStatus(status: string): Element;
};
