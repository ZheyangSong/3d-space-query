cmake_minimum_required(
  VERSION 3.25
)

add_library(engine_core engine.cpp)

target_include_directories(engine_core PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}
)
