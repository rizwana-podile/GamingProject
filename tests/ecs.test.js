/**
 * Unit Test Suite - Entity Component System (ECS) Module
 * Tests EntityManager entity creation, component registration, bitmask queries, and destruction.
 */

const assert = require('assert');
const EntityManager = require('../js/engine/ecs/entity_manager');

console.log('🧪 Testing Entity Component System (ECS)...');

const em = new EntityManager(100);
em.registerComponent('Transform', 0);
em.registerComponent('Velocity', 1);

const e1 = em.createEntity();
em.addComponent(e1, 'Transform', { x: 10, y: 20 });
em.addComponent(e1, 'Velocity', { vx: 1, vy: 2 });

const e2 = em.createEntity();
em.addComponent(e2, 'Transform', { x: 30, y: 40 });

const queryResult = em.queryEntities('Transform', 'Velocity');
assert.strictEqual(queryResult.length, 1);
assert.strictEqual(queryResult[0], e1);

em.destroyEntity(e1);
assert.strictEqual(em.hasComponent(e1, 'Transform'), false);

console.log('✅ All ECS unit tests passed successfully!\n');
