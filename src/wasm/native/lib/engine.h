#ifndef ENGINE_H
#define ENGINE_H

#include <vector>
#include <queue>
#include "./primitive.h"
#include "./BvhNode.h"
#include "./BestSplit.h"
#include "./utils.h"

using namespace std;

class Engine {
  public:
    Engine() = default;
    vector<BvhNode> build(const vector<Primitive>& primitives);
    vector<uint> getOrderedPrimIndices();
    vector<uint> search(const Box& tgt);
    vector<vector<uint>> search(const vector<Box>& tgts);
  private:
    vector<BvhNode> bvhNodes;
    vector<uint> primitiveIndices;
    uint nodesUsed;
    uint N;
    void updateNodeBounds(const uint& nodeIdx, const vector<Primitive>& primitives);
    void subdivide(const uint& nodeIdx, const vector<Primitive>& primitives);
    BestSplit findBestSplitPlane(const BvhNode& bvhNode, const vector<Primitive>& primitives);
    float calculateNodeCost(const BvhNode& bvhNode);
    void intersect(const Box& tgt, const uint& nodeIdx, vector<uint>& result);
    bool intersectAABB(const Box& box, const float3& bmin, const float3& bmax);
};

#endif
