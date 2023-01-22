cmake_minimum_required(
  VERSION 3.25
)

add_library(functional_engine_core builder.cpp searcher.cpp)

target_include_directories(functional_engine_core PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}
)
