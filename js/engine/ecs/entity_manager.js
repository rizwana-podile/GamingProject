/**
 * Aetheria Engine - Entity Component System (ECS) Entity Manager
 * High-performance bitmask entity manager with TypedArray pools, recycled entity IDs,
 * component bitmask matching, and zero-allocation updates.
 */

class EntityManager {
  constructor(capacity = 2048) {
    this.capacity = capacity;
    this.nextEntityId = 1;
    this.freeEntities = [];
    this.activeEntities = new Set();

    // Component bitmasks (up to 32 component types per bitfield)
    this.componentMasks = new Uint32Array(capacity);

    // Component stores map: ComponentName -> Map(entityId -> ComponentData)
    this.stores = new Map();
  }

  registerComponent(name, componentMaskBit) {
    if (!this.stores.has(name)) {
      this.stores.set(name, {
        bit: 1 << componentMaskBit,
        data: new Map()
      });
    }
  }

  createEntity() {
    let id;
    if (this.freeEntities.length > 0) {
      id = this.freeEntities.pop();
    } else {
      id = this.nextEntityId++;
      if (id >= this.capacity) {
        throw new Error(`[EntityManager] Entity capacity overflow (${this.capacity})`);
      }
    }

    this.activeEntities.add(id);
    this.componentMasks[id] = 0;
    return id;
  }

  destroyEntity(id) {
    if (!this.activeEntities.has(id)) return;

    this.activeEntities.delete(id);
    this.componentMasks[id] = 0;

    for (const [_, store] of this.stores) {
      store.data.delete(id);
    }

    this.freeEntities.push(id);
  }

  addComponent(id, componentName, data = {}) {
    const store = this.stores.get(componentName);
    if (!store) {
      throw new Error(`[EntityManager] Component '${componentName}' not registered`);
    }

    store.data.set(id, data);
    this.componentMasks[id] |= store.bit;
    return data;
  }

  removeComponent(id, componentName) {
    const store = this.stores.get(componentName);
    if (store) {
      store.data.delete(id);
      this.componentMasks[id] &= ~store.bit;
    }
  }

  getComponent(id, componentName) {
    const store = this.stores.get(componentName);
    return store ? store.data.get(id) : undefined;
  }

  hasComponent(id, componentName) {
    const store = this.stores.get(componentName);
    if (!store) return false;
    return (this.componentMasks[id] & store.bit) !== 0;
  }

  queryEntities(...componentNames) {
    let requiredMask = 0;
    for (const name of componentNames) {
      const store = this.stores.get(name);
      if (store) {
        requiredMask |= store.bit;
      }
    }

    const matching = [];
    for (const id of this.activeEntities) {
      if ((this.componentMasks[id] & requiredMask) === requiredMask) {
        matching.push(id);
      }
    }

    return matching;
  }

  clear() {
    this.activeEntities.clear();
    this.componentMasks.fill(0);
    this.freeEntities = [];
    this.nextEntityId = 1;
    for (const [_, store] of this.stores) {
      store.data.clear();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EntityManager;
}
