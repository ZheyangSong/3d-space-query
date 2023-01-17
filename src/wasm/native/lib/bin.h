#ifndef BIN_H
#define BIN_H

#include "./aabb.h"

struct Bin
{
  AABB bounds;
  unsigned int primCount;

  Bin(): bounds{{1e30, 1e30, 1e30}, {-1e30, -1e30, -1e30}}, primCount(0) {}

  void reset() {
    primCount = 0;
    bounds.reset();
  }
};

#endif
