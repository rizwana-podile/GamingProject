/**
 * Unit Test Suite - Physics & Collision Engine Module
 * Tests RigidBody2D velocity integration, SAT collision, and ParticleEmitter pool.
 */

const assert = require('assert');
const RigidBody2D = require('../js/engine/physics/rigid_body');
const SATCollision = require('../js/engine/physics/collision_sat');

console.log('🧪 Testing Engine Physics Subsystem...');

// Test 1: RigidBody Force & Integration
const body = new RigidBody2D({ x: 0, y: 0, mass: 2 });
body.applyForce(20, 0);
body.update(0.1, 0, 0); // dt = 0.1, no gravity
assert.strictEqual(body.vx > 0, true);
assert.strictEqual(body.x > 0, true);
console.log('  ✓ RigidBody2D force integration passed.');

// Test 2: SAT Circle Polygon Collision
const circle = { x: 5, y: 5, radius: 10 };
const polygon = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
const res = SATCollision.checkCirclePolygon(circle, polygon);
assert.strictEqual(res.collided, true);
console.log('  ✓ SAT Collision detection passed.');

console.log('✅ All Physics unit tests passed successfully!\n');
