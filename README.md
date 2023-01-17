# 3d-space-query

## Planned development work:
- [x] add a JS version of the single-threaded implementation
- [ ] add a WASM verion of the single-threaded implementation --- **in progress**
- [ ] add basic UTs monitoring the different implementations' correctness
  - [x] JS implementation (single-threaded)
  - [ ] WASM implementation (single-threaded)
- [ ] add basic script running benchmark tasks against different implmenetations. And set up intuitive speed/performance expectation. 
  - in term of speed:
    - multi-threaded is faster than single threaded
    - wasm is faster than JS
    - performance gain grows as the input scales up
  - in term of memory usage:
    - multi-threaded uses more than single-threaded
    - wasm uses more than JS
- [ ] add a multi-threaded implementation in JS
  - [ ] build
  - [ ] search - optional
- [ ] add a multi-threaded implementation in wasm (might replace the single threaded wasm implementation if possible)
  - [ ] build
  - [ ] search - optional
- [ ] enrich the supported geometric query
  - [x] initial support: aabb
  - [ ] later support: ray
- [ ] (bonus) migrate multi-threaded implementations to GPU if possible
