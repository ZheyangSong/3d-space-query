#include <algorithm>
#include "./builder.h"
#include "../bin.h"
#include "../box.h"

using namespace std;

uint nodesUsed;

/**
 * primitive memory layout
 * aabbmin(3f) | aabbmax(3f) | centroid(3f)
 * 
 * tree node memory layout
 * aabbmin(3f) | aabbmax(3f) | leftFirst (ui) | primCount (ui)
 */
extern "C" void build(const void * boxMem, uint boxTotal, uint * indices, void * treeMem) {
  nodesUsed = 1;

  if (boxTotal <= 0) {
    return;
  }

  const Box * boxes = reinterpret_cast<const Box *>(boxMem);
  BvhNode * tree = reinterpret_cast<BvhNode *>(treeMem);

  const uint rootNodeIdx = 0;
  BvhNode &root = *(initNode(tree, rootNodeIdx));
  root.leftFirst = 0;
  root.primCount = boxTotal;

  for (int i = 0; i < boxTotal; i++) {
    indices[i] = i;
  }

  updateNodeBounds(root, boxes, boxTotal, indices);
  subdivide(root, boxes, boxTotal, indices, tree);
}

BvhNode * initNode(BvhNode * memPtr, uint index) {
  /**
   * Note: as the memory is initialized externally, 
   *       each node's initial state isn't controlled.
   *       Thus, it has to be updated to the proper one.
   */
  return new(memPtr + index) BvhNode();
}

void updateNodeBounds(BvhNode& node, const Box * boxes, uint &pSize, uint * indices)
{
  if (!node.primCount)
  {
    return;
  }

  uint last = node.leftFirst + node.primCount;
  for (uint i = node.leftFirst; i < last; i++)
  {
    const Box &primitive = boxes[indices[i]];

    node.aabbMin.x = min(node.aabbMin.x, primitive.aabbMin.x);
    node.aabbMin.y = min(node.aabbMin.y, primitive.aabbMin.y);
    node.aabbMin.z = min(node.aabbMin.z, primitive.aabbMin.z);

    node.aabbMax.x = max(node.aabbMax.x, primitive.aabbMax.x);
    node.aabbMax.y = max(node.aabbMax.y, primitive.aabbMax.y);
    node.aabbMax.z = max(node.aabbMax.z, primitive.aabbMax.z);
  }
}

void subdivide(BvhNode &node, const Box * boxes, uint &pSize, uint * indices, BvhNode * tree)
{
  BestSplit res = findBestSplitPlane(node, boxes, indices);
  const unsigned short axis = res.axis;
  const float splitPlane = res.splitPlane;
  const float splitCost = res.splitCost;
  float nodeCost = calculateNodeCost(node);

  if (splitCost >= nodeCost)
  {
    return;
  }

  uint i = node.leftFirst;
  uint j = i + node.primCount - 1;
  while (i <= j)
  {
    const Primitive &primitive = Primitive(boxes[indices[i]]);

    if (primitive.centroid[axis] < splitPlane)
    {
      i++;
    }
    else
    {
      swap(i, j--, indices);
    }
  }

  uint leftCount = i - node.leftFirst;
  if (leftCount == 0 || leftCount == node.primCount)
  {
    return;
  }

  uint leftChildIdx = nodesUsed++;
  uint rightChildIdx = nodesUsed++;
  BvhNode & lNode = *(initNode(tree, leftChildIdx));
  BvhNode & rNode = *(initNode(tree, rightChildIdx));
  lNode.leftFirst = node.leftFirst;
  lNode.primCount = leftCount;
  rNode.leftFirst = i;
  rNode.primCount = node.primCount - leftCount;
  node.leftFirst = leftChildIdx;
  node.primCount = 0;
  updateNodeBounds(lNode, boxes, pSize, indices);
  updateNodeBounds(rNode, boxes, pSize, indices);
  subdivide(lNode, boxes, pSize, indices, tree);
  subdivide(rNode, boxes, pSize, indices, tree);
}

BestSplit findBestSplitPlane(const BvhNode &bvhNode, const Box * boxes, uint * indices)
{
  unsigned short bestAxis = 0;
  float bestPlane = -1;
  float bestCost = 1e30;
  const uint BIN_CNT = 4;
  const uint pCnt = bvhNode.primCount;

  for (unsigned short axis = 0; axis < 3; axis++)
  {
    float boundsMin = 1e30;
    float boundsMax = -1e30;

    for (uint i = 0; i < pCnt; i++)
    {
      const Primitive &primitive = Primitive(boxes[indices[bvhNode.leftFirst + i]]);
      boundsMin = min(boundsMin, primitive.centroid[axis]);
      boundsMax = max(boundsMax, primitive.centroid[axis]);
    }

    if (boundsMax == boundsMin)
    {
      continue;
    }

    Bin bin[BIN_CNT];

    float rBinWidth = BIN_CNT / (boundsMax - boundsMin);
    for (uint i = 0; i < pCnt; i++)
    {
      const Primitive &primitive = Primitive(boxes[indices[bvhNode.leftFirst + i]]);
      uint binIdx = min(BIN_CNT - 1, (uint)((primitive.centroid[axis] - boundsMin) * rBinWidth));
      bin[binIdx].primCount++;
      bin[binIdx].bounds.grow(primitive);
    }

    float leftArea[BIN_CNT - 1];
    float rightArea[BIN_CNT - 1];
    float leftCount[BIN_CNT - 1];
    float rightCount[BIN_CNT - 1];
    AABB leftBox, rightBox;
    float leftSum = 0, rightSum = 0;
    for (uint i = 0; i < BIN_CNT - 1; i++)
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
    for (uint i = 0; i < BIN_CNT - 1; i++)
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

float calculateNodeCost(const BvhNode &bvhNode)
{
  return bvhNode.primCount * boxArea(bvhNode.aabbMin, bvhNode.aabbMax);
}
