#include <iostream>
#include <cstdlib>
#include <time.h>
#include <vector>
#include "../lib/engine.h"
#include "../lib/primitive.h"
#include "../lib/utils.h"
#include "./utils.h"

using namespace std;

float getRand() {
  return ((float) rand()) / RAND_MAX;
}

vector<Primitive> genObjs(const float min[3], const float max[3], const float size[3], const unsigned int pCnt) {
  vector<Primitive> result;
  result.reserve(pCnt);

  for (unsigned i = 0; i <pCnt; i++) {
    float xmin = fminf(getRand() * (max[0] - min[0] + 1) + min[0], max[0] - size[0]),
    ymin = fminf(getRand() * (max[1] - min[1] + 1) + min[1], max[1] - size[1]),
    zmin = fminf(getRand() * (max[2] - min[2] + 1) + min[2], max[2] - size[2]),
    xmax = fminf(getRand() * (size[0] + 1) + xmin, max[0]),
    ymax = fminf(getRand() * (size[1] + 1) + ymin, max[1]),
    zmax = fminf(getRand() * (size[2] + 1) + zmin, max[2]);

    result.push_back({
      { xmin, ymin, zmin },
      { xmax, ymax, zmax },
      {
        (xmax - xmin)  / 2 + xmin,
        (ymax - ymin)  / 2 + ymin,
        (zmax - zmin)  / 2 + zmin,
      }
    });
  }

  return result;
}

int main() {
  srand(time(0));

  Engine engine;

  unsigned int primitiveCnt = 5000;
  float min[] = {-1000, -1000, -1000};
  float max[] = {1000, 1000, 1000};
  float size[] = {30, 20, 50};
  vector<Primitive> primitives = genObjs(min, max, size, primitiveCnt);

  unsigned int objCnt = 30000;
  float csize[] = {40, 20, 30};
  vector<Primitive> objToCheck = genObjs(min, max, csize, objCnt);

	Timer t;
  engine.build(primitives);
  printf( "\nBVH constructed (via native engine) (%i primitives) in %.2fms.\n", primitiveCnt, t.elapsed() * 1000 );

  t.reset();
  for (Primitive o : objToCheck) {
    vector<unsigned int> found = engine.search(o);
  }
  printf( "Search (via native engine) %lu objects in %.2fms.\n", objToCheck.size(), t.elapsed() * 1000 );

  return 0;
}
