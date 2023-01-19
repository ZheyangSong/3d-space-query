#ifndef UTILS_H
#define UTILS_H

#include <vector>

typedef unsigned int uint;

// math
struct float3
{
	float3() = default;
	float3( const float a, const float b, const float c ) : x( a ), y( b ), z( c ) {}
	float3( const float a ) : x( a ), y( a ), z( a ) {}
	union { struct { float x, y, z; }; float cell[3]; };
	float operator [] ( const int n ) const { return cell[n]; }
};

inline float3 make_float3( const float& a, const float& b, const float& c ) { float3 f3; f3.x = a, f3.y = b, f3.z = c; return f3; }
inline float3 operator-( const float3& a, const float3& b ) { return make_float3( a.x - b.x, a.y - b.y, a.z - b.z ); }

inline float boxArea(const float3& min, const float3& max) {
  float3 diff = max - min;

  return diff.x * diff.x + diff.y * diff.y + diff.z * diff.z;
}

inline void swap(const uint& a, const uint& b, uint * arr) {
  uint tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;
}

inline void swap(const uint& a, const uint& b, std::vector<uint>& arr) {
  uint tmp = arr[a];
  arr[a] = arr[b];
  arr[b] = tmp;
}

#endif
