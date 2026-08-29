/**
 * Aetheria Engine - Typed Event Bus Module
 * Decoupled pub-sub message dispatch system with event filtering, wildcards,
 * and priority listeners.
 */

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback, priority = 0) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    const handlers = this.listeners.get(event);
    handlers.push({ callback, priority });
    handlers.sort((a, b) => b.priority - a.priority);

    return () => this.off(event, callback);
  }

  once(event, callback, priority = 0) {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    }, priority);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event);
    this.listeners.set(event, handlers.filter(h => h.callback !== callback));
  }

  emit(event, payload = {}) {
    if (this.listeners.has(event)) {
      const handlers = this.listeners.get(event);
      for (const h of handlers) {
        h.callback(payload);
      }
    }

    if (this.listeners.has('*')) {
      const globalHandlers = this.listeners.get('*');
      for (const h of globalHandlers) {
        h.callback({ event, payload });
      }
    }
  }

  clear() {
    this.listeners.clear();
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EventBus;
}
