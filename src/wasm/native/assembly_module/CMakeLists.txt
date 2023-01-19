cmake_minimum_required(VERSION 3.25)

project(WasmEngine)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR})
set(CMAKE_BUILD_TYPE "Release")
set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED True)

if (${CMAKE_SYSTEM_NAME} MATCHES "Emscripten")
    set(CMAKE_C_COMPILER "emcc")
    set(CMAKE_CXX_COMPILER "emcc")
endif ()

include_directories(
  $ENV{EMSCRIPTEN_DIR}/system
)

add_executable(wasm-core ../lib/engine.cpp ../lib/builder.cpp ../lib/searcher.cpp ../lib/binding.cpp)

target_include_directories(wasm-core PUBLIC
  ../lib
)
# -sEXPORT_ES6=1 -sUSE_ES6_IMPORT_META=0 -sSINGLE_FILE=1 -sENVIRONMENT='web'
if (${CMAKE_SYSTEM_NAME} MATCHES "Emscripten")
    set_target_properties(wasm-core PROPERTIES LINK_FLAGS "-o dist/wasm-core.js -lembind -O3 -sEXPORT_ES6=1 -sEXPORTED_FUNCTIONS=_build,_search -sEXPORTED_RUNTIME_METHODS=ccall,cwrap -sUSE_ES6_IMPORT_META=0 -sENVIRONMENT='web' -sSINGLE_FILE=1 -sMODULARIZE=1 -sEXPORT_NAME=\"WasmLoader\"  -sALLOW_MEMORY_GROWTH=1 -std=c++11")
endif ()
