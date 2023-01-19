#include "./BvhNode.h"
#include "./BestSplit.h"
#include "./utils.h"
#include "./primitive.h"

extern "C" void build(const float * primitives, uint pSize, uint * indices, BvhNode * tree);

void updateNodeBounds(const uint &nodeIdx, const Primitive * primitives, uint &pSize, uint * indices, BvhNode * tree);

void subdivide(const uint &nodeIdx, const Primitive * primitives, uint &pSize, uint * indices, BvhNode * tree);

BestSplit findBestSplitPlane(const BvhNode &bvhNode, const Primitive * primitives, uint * indices);

float calculateNodeCost(const BvhNode &bvhNode);
