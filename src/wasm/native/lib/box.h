#ifndef BOX_H
#define BOX_H

#include "./aabb.h"

struct Box {
    float3 aabbMin;
    float3 aabbMax;

    Box() = default;
    operator AABB() const { return AABB(aabbMin, aabbMax); }
};

#endif
