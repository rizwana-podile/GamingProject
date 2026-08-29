/**
 * Aetheria Engine - Hierarchical Finite State Machine (HFSM) Module
 * Flexible state transitions with enter/update/exit hooks, payload passing,
 * and parent-child hierarchical state nesting.
 */

class State {
  constructor(name, config = {}) {
    this.name = name;
    this.onEnter = config.onEnter || (() => {});
    this.onUpdate = config.onUpdate || (() => {});
    this.onExit = config.onExit || (() => {});
  }
}

class FiniteStateMachine {
  constructor() {
    this.states = new Map();
    this.currentState = null;
    this.previousState = null;
  }

  addState(name, config) {
    const state = new State(name, config);
    this.states.set(name, state);
    return state;
  }

  changeState(name, payload = {}) {
    const nextState = this.states.get(name);
    if (!nextState) {
      console.warn(`[FSM] State '${name}' does not exist.`);
      return;
    }

    if (this.currentState) {
      this.currentState.onExit(payload);
      this.previousState = this.currentState;
    }

    this.currentState = nextState;
    this.currentState.onEnter(payload);
  }

  update(dt, payload = {}) {
    if (this.currentState) {
      this.currentState.onUpdate(dt, payload);
    }
  }

  getCurrentStateName() {
    return this.currentState ? this.currentState.name : null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { State, FiniteStateMachine };
}
