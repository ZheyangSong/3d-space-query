#ifndef BVHNODE_H
#define BVHNODE_H

#include "./utils.h"

class BvhNode {
  public:
    float3 aabbMin;
    float3 aabbMax;
    unsigned int leftFirst;
    unsigned int primCount;
    BvhNode(): aabbMin{1e30, 1e30, 1e30}, aabbMax{-1e30, -1e30, -1e30}, leftFirst(0), primCount(0) {}
    inline bool isLeaf() { return primCount > 0; };
};
#endif
