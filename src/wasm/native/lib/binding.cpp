#include <emscripten/bind.h>
#include "./engine.h"
#include "./primitive.h"
#include "./box.h"

namespace em = emscripten;

EMSCRIPTEN_BINDINGS(spacial_query_engine) {
  em::value_object<float3>("Vector3")
  .field("x", &float3::x)
  .field("y", &float3::y)
  .field("z", &float3::z);
  em::value_object<Box>("Box")
  .field("aabbMin", &Box::aabbMin)
  .field("aabbMax", &Box::aabbMax);
  em::value_object<Primitive>("Primitive")
  .field("aabbMin", &Primitive::aabbMin)
  .field("aabbMax", &Primitive::aabbMax)
  .field("centroid", &Primitive::centroid);
  em::class_<BvhNode>("BvhNode")
  .property("aabbMin", &BvhNode::aabbMin)
  .property("aabbMax", &BvhNode::aabbMax)
  .property("leftFirst", &BvhNode::leftFirst)
  .property("primCount", &BvhNode::primCount)
  .function("isLeaf", &BvhNode::isLeaf);

  em::register_vector<Primitive>("PrimitiveList");
  em::register_vector<Box>("BoxList");

  em::register_vector<unsigned int>("IndexList");
  em::register_vector<vector<unsigned int>>("MultiIndexLists");

  em::register_vector<BvhNode>("BvhNodeList");

  em::class_<Engine>("Engine")
    .constructor()
    .function("build", &Engine::build)
    .function("getOrderedPrimIndices", &Engine::getOrderedPrimIndices)
    .function("searchOne", em::select_overload<vector<unsigned int>(const Box&)>(&Engine::search))
    .function("searchMany", em::select_overload<vector<vector<unsigned int>>(const vector<Box>&)>(&Engine::search));
}
