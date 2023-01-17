#include <iostream>
#include <algorithm>
#include "./engine.h"
#include "./bin.h"
#include "./utils.h"
#include "./primitive.h"
#include "./box.h"

using namespace std;

vector<unsigned int> Engine::getOrderedPrimIndices()
{
  return primitiveIndices;
}

vector<BvhNode> Engine::build(const vector<Primitive> &primitives)
{
  nodesUsed = 1;
  N = primitives.size();

  bvhNodes.resize(2 * N - 1);
  fill(bvhNodes.begin(), bvhNodes.end(), BvhNode());

  primitiveIndices.resize(N);
  for (unsigned int i = 0; i < N; i++)
  {
    primitiveIndices[i] = i;
  }

  const unsigned int rootNodeIdx = 0;
  BvhNode &root = bvhNodes[rootNodeIdx];
  root.leftFirst = 0;
  root.primCount = N;

  updateNodeBounds(rootNodeIdx, primitives);
  subdivide(rootNodeIdx, primitives);

  return bvhNodes;
}

void Engine::updateNodeBounds(const unsigned int &nodeIdx, const vector<Primitive> &primitives)
{
  BvhNode &node = bvhNodes[nodeIdx];
  if (!node.primCount)
  {
    return;
  }

  unsigned int last = node.leftFirst + node.primCount;
  for (unsigned int i = node.leftFirst; i < last; i++)
  {
    const Primitive &primitive = primitives[primitiveIndices[i]];

    node.aabbMin.x = min(node.aabbMin.x, primitive.aabbMin.x);
    node.aabbMin.y = min(node.aabbMin.y, primitive.aabbMin.y);
    node.aabbMin.z = min(node.aabbMin.z, primitive.aabbMin.z);

    node.aabbMax.x = max(node.aabbMax.x, primitive.aabbMax.x);
    node.aabbMax.y = max(node.aabbMax.y, primitive.aabbMax.y);
    node.aabbMax.z = max(node.aabbMax.z, primitive.aabbMax.z);
  }
}

void Engine::subdivide(const unsigned int &nodeIdx, const vector<Primitive> &primitives)
{
  BvhNode &node = bvhNodes[nodeIdx];

  BestSplit res = findBestSplitPlane(node, primitives);
  const unsigned short axis = res.axis;
  const float splitPlane = res.splitPlane;
  const float splitCost = res.splitCost;
  float nodeCost = calculateNodeCost(node);

  if (splitCost >= nodeCost)
  {
    return;
  }

  unsigned int i = node.leftFirst;
  unsigned int j = i + node.primCount - 1;
  while (i <= j)
  {
    const Primitive &primitive = primitives[primitiveIndices[i]];

    if (primitive.centroid[axis] < splitPlane)
    {
      i++;
    }
    else
    {
      swap(i, j--, primitiveIndices);
    }
  }

  unsigned int leftCount = i - node.leftFirst;
  if (leftCount == 0 || leftCount == node.primCount)
  {
    return;
  }

  unsigned int leftChildIdx = nodesUsed++;
  unsigned int rightChildIdx = nodesUsed++;
  bvhNodes[leftChildIdx].leftFirst = node.leftFirst;
  bvhNodes[leftChildIdx].primCount = leftCount;
  bvhNodes[rightChildIdx].leftFirst = i;
  bvhNodes[rightChildIdx].primCount = node.primCount - leftCount;
  node.leftFirst = leftChildIdx;
  node.primCount = 0;
  updateNodeBounds(leftChildIdx, primitives);
  updateNodeBounds(rightChildIdx, primitives);
  subdivide(leftChildIdx, primitives);
  subdivide(rightChildIdx, primitives);
}

BestSplit Engine::findBestSplitPlane(const BvhNode &bvhNode, const vector<Primitive> &primitives)
{
  unsigned short bestAxis = 0;
  float bestPlane = -1;
  float bestCost = 1e30;
  const unsigned int BIN_CNT = 4;
  const unsigned int pCnt = bvhNode.primCount;

  for (unsigned short axis = 0; axis < 3; axis++)
  {
    float boundsMin = 1e30;
    float boundsMax = -1e30;

    for (unsigned int i = 0; i < pCnt; i++)
    {
      const Primitive &primitive = primitives[primitiveIndices[bvhNode.leftFirst + i]];

      boundsMin = min(boundsMin, primitive.centroid[axis]);
      boundsMax = max(boundsMax, primitive.centroid[axis]);
    }

    if (boundsMax == boundsMin)
    {
      continue;
    }

    Bin bin[BIN_CNT];

    float rBinWidth = BIN_CNT / (boundsMax - boundsMin);
    for (unsigned int i = 0; i < pCnt; i++)
    {
      const Primitive &primitive = primitives[primitiveIndices[bvhNode.leftFirst + i]];
      unsigned int binIdx = min(BIN_CNT - 1, (unsigned int)((primitive.centroid[axis] - boundsMin) * rBinWidth));
      bin[binIdx].primCount++;
      bin[binIdx].bounds.grow(primitive);
    }

    float leftArea[BIN_CNT - 1];
    float rightArea[BIN_CNT - 1];
    float leftCount[BIN_CNT - 1];
    float rightCount[BIN_CNT - 1];
    AABB leftBox, rightBox;
    float leftSum = 0, rightSum = 0;
    for (unsigned int i = 0; i < BIN_CNT - 1; i++)
    {
      leftSum += bin[i].primCount;
      leftCount[i] = leftSum;
      leftBox.grow(bin[i].bounds);
      leftArea[i] = leftBox.area();
      rightSum += bin[BIN_CNT - 1 - i].primCount;
      rightCount[BIN_CNT - 2 - i] = rightSum;
      rightBox.grow(bin[BIN_CNT - 1 - i].bounds);
      rightArea[BIN_CNT - 2 - i] = rightBox.area();
    }

    float binWidth = 1 / rBinWidth;
    for (unsigned int i = 0; i < BIN_CNT - 1; i++)
    {
      float cost = leftCount[i] * leftArea[i] + rightCount[i] * rightArea[i];

      if (cost < bestCost)
      {
        bestPlane = boundsMin + binWidth * (i + 1);
        bestAxis = axis;
        bestCost = cost;
      }
    }
  }

  return BestSplit{bestPlane, bestCost, bestAxis};
}

float Engine::calculateNodeCost(const BvhNode &bvhNode)
{
  return bvhNode.primCount * boxArea(bvhNode.aabbMin, bvhNode.aabbMax);
}

vector<unsigned int> Engine::search(const Box &tgt)
{
  vector<unsigned int> result;

  if (!bvhNodes.size())
  {
    return result;
  }

  intersect(tgt, 0, result);

  return result;
}

vector<vector<unsigned int>> Engine::search(const vector<Box> &tgts)
{
  vector<vector<unsigned int>> result;

  for (auto tgt : tgts)
  {
    result.push_back(search(tgt));
  }

  return result;
}

void Engine::intersect(const Box &tgt, const unsigned int &nodeIdx, vector<unsigned int> &result)
{
  if (!bvhNodes.size())
  {
    return;
  }

  BvhNode &node = bvhNodes[nodeIdx];
  if (!intersectAABB(tgt, node.aabbMin, node.aabbMax))
  {
    return;
  }

  if (node.isLeaf())
  {
    for (unsigned int i = 0; i < node.primCount; i++)
    {
      result.push_back(primitiveIndices[node.leftFirst + i]);
    }
  }
  else
  {
    intersect(tgt, node.leftFirst, result);
    intersect(tgt, node.leftFirst + 1, result);
  }
}

bool Engine::intersectAABB(const Box &box, const float3 &bmin, const float3 &bmax)
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