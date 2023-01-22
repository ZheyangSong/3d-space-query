export function getTimeMeasurer<T extends Record<string, number>>(
  defaultCnfg: T
) {
  type TK = keyof T;
  const measured: T = {
    ...defaultCnfg,
  };

  return {
    measure<C extends () => any>(tag: TK, cb: C): ReturnType<C> {
      let start = Date.now();
      const res = cb();
      measured[tag] = (Date.now() - start) as T[TK];

      return res;
    },
    getMeasures() {
      return {
        ...measured,
      };
    },
  };
}
