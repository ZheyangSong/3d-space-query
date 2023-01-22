#include "../BvhNode.h"
#include "../BestSplit.h"
#include "../utils.h"
#include "../primitive.h"

extern "C" void build(const void * primitivesMem, uint pSize, uint * indices, void * treeMem);

BvhNode * initNode(BvhNode * memPtr, uint index);

void updateNodeBounds(BvhNode& node, const Box * primitives, uint &pSize, uint * indices);

void subdivide(BvhNode &node, const Box * primitives, uint &pSize, uint * indices, BvhNode * tree);

BestSplit findBestSplitPlane(const BvhNode &bvhNode, const Box * primitives, uint * indices);

float calculateNodeCost(const BvhNode &bvhNode);
