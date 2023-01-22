#include <iostream>
#include <algorithm>
#include "./searcher.h"

using namespace std;

extern "C" uint search(const Box *tgt, uint * indices, BvhNode * tree, uint*result)
{
  vector<uint> foundIds;
  intersect(*tgt, 0, tree, indices, foundIds);

  size_t foundTotal = foundIds.size();

  if (foundTotal > 0) {
    copy(foundIds.begin(), foundIds.end(), result);
  }

  return foundTotal;
}

void intersect(const Box &tgt, const uint &nodeIdx, BvhNode * tree, uint * indices, vector<uint> &result)
{
  BvhNode &node = tree[nodeIdx];
  if (!intersectAABB(tgt, node.aabbMin, node.aabbMax))
  {
    return;
  }

  if (node.isLeaf())
  {
    for (uint i = 0; i < node.primCount; i++)
    {
      result.push_back(indices[node.leftFirst + i]);
    }
  }
  else
  {
    intersect(tgt, node.leftFirst, tree, indices, result);
    intersect(tgt, node.leftFirst + 1, tree, indices, result);
  }
}

bool intersectAABB(const Box &box, const float3 &bmin, const float3 &bmax)
{
  bool result = true;

  for (int axis = 0; axis < 3 && result; axis++)
  {
    result =
        result &&
        !(box.aabbMax[axis] < bmin[axis] || box.aabbMin[axis] > bmax[axis]);
  }

  return result;
}
