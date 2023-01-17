cmake_minimum_required(
  VERSION 3.25
)

add_executable(test_driver main.cpp)

target_link_libraries (test_driver LINK_PUBLIC engine_core)

target_include_directories(test_driver PUBLIC
  ${CMAKE_CURRENT_SOURCE_DIR}
  ../lib
)
