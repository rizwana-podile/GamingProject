/**
 * Aetheria Engine - ECS System Pipeline Module
 * Ordered processing pipeline executing registered gameplay systems
 * (Movement, Physics, AI, Collision, Animation, Rendering).
 */

class SystemPipeline {
  constructor(entityManager) {
    this.entityManager = entityManager;
    this.systems = [];
  }

  addSystem(name, priority, updateFn) {
    this.systems.push({ name, priority, updateFn });
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  removeSystem(name) {
    this.systems = this.systems.filter(sys => sys.name !== name);
  }

  update(dt) {
    for (const sys of this.systems) {
      sys.updateFn(this.entityManager, dt);
    }
  }

  clear() {
    this.systems = [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SystemPipeline;
}
