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
    vector<unsigned int> getOrderedPrimIndices();
    vector<unsigned int> search(const Box& tgt);
    vector<vector<unsigned int>> search(const vector<Box>& tgts);
  private:
    vector<BvhNode> bvhNodes;
    vector<unsigned int> primitiveIndices;
    unsigned int nodesUsed;
    unsigned int N;
    void updateNodeBounds(const unsigned int& nodeIdx, const vector<Primitive>& primitives);
    void subdivide(const unsigned int& nodeIdx, const vector<Primitive>& primitives);
    BestSplit findBestSplitPlane(const BvhNode& bvhNode, const vector<Primitive>& primitives);
    float calculateNodeCost(const BvhNode& bvhNode);
    void intersect(const Box& tgt, const unsigned int& nodeIdx, vector<unsigned int>& result);
    bool intersectAABB(const Box& box, const float3& bmin, const float3& bmax);
};

#endif
