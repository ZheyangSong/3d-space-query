#ifndef PRIMITIVE_H
#define PRIMITIVE_H

#include "./utils.h"
#include "./box.h"

struct Primitive: public Box {
    float3 centroid;

    Primitive(): Box() {}
};

#endif
