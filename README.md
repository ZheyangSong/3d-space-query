# 3d-space-query

## Planned development work:
- [x] add a JS version of the single-threaded implementation
- [x] add a WASM verion of the single-threaded implementation
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

## Example Screenshots:
* index 5000 boxes + check 50000 targets
  ![index 5000 boxes + check 50000 targets](screenshots/5000_50000.png)

* index 50000 boxes + check 50000 targets
  ![index 50000 boxes + check 50000 targets](screenshots/50000_50000.png)

* index 100000 boxes + check 50000 targets
  ![index 100000 boxes + check 50000 targets](screenshots/100000_50000.png)
