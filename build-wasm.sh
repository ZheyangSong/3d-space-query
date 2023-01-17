#!/usr/bin/env bash

WASM_BUILD_PATH="build/wasm"

[ ! -d $WASM_BUILD_PATH ] && mkdir -p $WASM_BUILD_PATH

cd $WASM_BUILD_PATH

EMSCRIPTEN_DIR=~/Documents/emsdk/upstream/emscripten \
cmake -DCMAKE_TOOLCHAIN_FILE=$EMSCRIPTEN_DIR/cmake/Modules/Platform/Emscripten.cmake \
../../src/wasm/native/assembly_module

make
