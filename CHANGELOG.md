# CHANGELOG

## 1.0.1
- initial relase

## 1.0.2
- add unit test tooling and basic test cases

## 1.1.0
- add new static method, `Engine.from`. With this method, one can rehydrate an instance build from differente context. For example, the instance is built inside a worker and the main thread can then rebuild the instance from the instance state sent by the worker.
