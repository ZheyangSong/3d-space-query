#include <vector>
#include "../utils.h"
#include "../box.h"
#include "../BvhNode.h"

extern "C" uint search(const Box *tgt, uint * indices, BvhNode * tree, uint*result);

void intersect(const Box &tgt, const uint &nodeIdx, BvhNode * tree, uint * indices, std::vector<uint> &result);

bool intersectAABB(const Box &box, const float3 &bmin, const float3 &bmax);
