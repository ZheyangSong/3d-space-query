#ifndef BVHNODE_H
#define BVHNODE_H

#include "./utils.h"

class BvhNode {
  public:
    float3 aabbMin; // 12 bytes
    float3 aabbMax; // 12 bytes
    uint leftFirst; // 4bytes
    uint primCount; // 4bytes
    BvhNode(): aabbMin{1e30, 1e30, 1e30}, aabbMax{-1e30, -1e30, -1e30}, leftFirst(0), primCount(0) {}
    inline bool isLeaf() { return primCount > 0; };
};
#endif
