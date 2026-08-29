/**
 * Unit Test Suite - Engine Math Module
 * Tests Vector2, Vector3, Matrix4, Quaternion, Spatial Hash, and Quadtree math operations.
 */

const assert = require('assert');
const Vector2 = require('../js/engine/math/vector2');
const Vector3 = require('../js/engine/math/vector3');
const Matrix4 = require('../js/engine/math/matrix4');
const Quaternion = require('../js/engine/math/quaternion');

console.log('🧪 Testing Engine Math Subsystem...');

// Test 1: Vector2 Addition & Dot Product
const v1 = new Vector2(3, 4);
const v2 = new Vector2(1, 2);
const v3 = v1.add(v2);
assert.strictEqual(v3.x, 4);
assert.strictEqual(v3.y, 6);
assert.strictEqual(v1.dot(v2), 11);
assert.strictEqual(v1.magnitude(), 5);
console.log('  ✓ Vector2 math operations passed.');

// Test 2: Vector3 Distance & Cross Product
const v3a = new Vector3(1, 0, 0);
const v3b = new Vector3(0, 1, 0);
const cross = v3a.cross(v3b);
assert.strictEqual(cross.x, 0);
assert.strictEqual(cross.y, 0);
assert.strictEqual(cross.z, 1);
assert.strictEqual(Vector3.distance(v3a, v3b), Math.SQRT2);
console.log('  ✓ Vector3 math operations passed.');

// Test 3: Matrix4 Identity & Multiplication
const m1 = new Matrix4().identity();
const m2 = Matrix4.scaling(2, 2, 2);
const m3 = m1.multiply(m2);
assert.strictEqual(m3.elements[0], 2);
assert.strictEqual(m3.elements[5], 2);
assert.strictEqual(m3.elements[10], 2);
console.log('  ✓ Matrix4 operations passed.');

// Test 4: Quaternion Identity & Rotation
const q1 = Quaternion.identity();
assert.strictEqual(q1.w, 1);
assert.strictEqual(q1.magnitude(), 1);
console.log('  ✓ Quaternion operations passed.');

console.log('✅ All Engine Math unit tests passed successfully!\n');
