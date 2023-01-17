#ifndef AABB_H
#define AABB_H

#include <algorithm>
#include "./utils.h"

struct AABB
{
  float3 aabbMin;
  float3 aabbMax;

  AABB(): aabbMin{1e30, 1e30, 1e30}, aabbMax{-1e30, -1e30, -1e30} {}
  AABB(float3 min, float3 max): aabbMin(min), aabbMax(max) {}

  void grow(const AABB& n) {
    aabbMin.x = std::min(aabbMin.x, n.aabbMin.x);
    aabbMin.y = std::min(aabbMin.y, n.aabbMin.y);
    aabbMin.z = std::min(aabbMin.z, n.aabbMin.z);

    aabbMax.x = std::max(aabbMax.x, n.aabbMax.x);
    aabbMax.y = std::max(aabbMax.y, n.aabbMax.y);
    aabbMax.z = std::max(aabbMax.z, n.aabbMax.z);
  }

  float area() {
    return boxArea(aabbMin, aabbMax);
  }

  void reset() {
    aabbMin = {1e30, 1e30, 1e30};
    aabbMax = {-1e30, -1e30, -1e30};
  }
};

#endif
