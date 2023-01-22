#ifndef PRIMITIVE_H
#define PRIMITIVE_H

#include "./utils.h"
#include "./box.h"

struct Primitive: public Box {
    float3 centroid;

    Primitive(): Box() {}
    Primitive(Box b): Box(b) {
      centroid.x = b.aabbMin.x + (b.aabbMax.x - b.aabbMin.x) / 2;
      centroid.y = b.aabbMin.y + (b.aabbMax.y - b.aabbMin.y) / 2;
      centroid.z = b.aabbMin.z + (b.aabbMax.z - b.aabbMin.z) / 2;
    }
};

#endif
