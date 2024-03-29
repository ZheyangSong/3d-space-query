# CHANGELOG

## 1.0.1
- initial relase

## 1.0.2
- add unit test tooling and basic test cases

## 1.1.0
- add new static method, `Engine.from`. With this method, one can rehydrate an instance build from differente context. For example, the instance is built inside a worker and the main thread can then rebuild the instance from the instance state sent by the worker.

## 1.2.0
- introduce wasm-based implementation, `NativeEngine`. This implemetation guarantees better build speed. But, the generated tree doesn't result in the best search performance. Thus, this implementation's cumulative search speed is slower than `Engine` for the moment. This might not be a significant issue, if the searching can be spreaded across multiple frames. Also, it's recommended to consider the wasm-based one for building huge search space (# of primitives > 10000).

## 1.2.1
- Duplicated.

## 1.2.2
- fix broken `Engine.search` when an `Engine` is instantiated via `Engine.from`.

## 1.3.0
- add support for query using point (TPoint) in `Engine`

## 1.4.0
- add support for exporting the data structure built by engine. The exported might be used for GPU ray-tracing or spatial searching.

## 1.4.1
- issue fix: the primitive index list is longer in packed mode.
