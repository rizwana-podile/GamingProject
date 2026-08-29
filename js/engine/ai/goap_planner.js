/**
 * Aetheria Engine - Goal-Oriented Action Planning (GOAP) Module
 * Dynamic action plan generator resolving state transitions via graph search
 * to achieve NPC high-level goals.
 */

class GOAPAction {
  constructor(name, cost = 1) {
    this.name = name;
    this.cost = cost;
    this.preconditions = new Map();
    this.effects = new Map();
  }

  addPrecondition(key, value) {
    this.preconditions.set(key, value);
    return this;
  }

  addEffect(key, value) {
    this.effects.set(key, value);
    return this;
  }

  checkPreconditions(state) {
    for (const [key, value] of this.preconditions) {
      if (state.get(key) !== value) {
        return false;
      }
    }
    return true;
  }

  applyEffects(state) {
    const newState = new Map(state);
    for (const [key, value] of this.effects) {
      newState.set(key, value);
    }
    return newState;
  }
}

class GOAPPlanner {
  constructor() {
    this.actions = [];
  }

  registerAction(action) {
    this.actions.push(action);
  }

  plan(worldState, goalState) {
    const rootNode = {
      state: new Map(worldState),
      cost: 0,
      action: null,
      parent: null
    };

    const openList = [rootNode];
    const closedList = [];

    let cheapestSolution = null;

    while (openList.length > 0) {
      openList.sort((a, b) => a.cost - b.cost);
      const currentNode = openList.shift();
      closedList.push(currentNode);

      if (this.satisfiesGoal(currentNode.state, goalState)) {
        cheapestSolution = currentNode;
        break;
      }

      for (const action of this.actions) {
        if (action.checkPreconditions(currentNode.state)) {
          const nextState = action.applyEffects(currentNode.state);
          const nextCost = currentNode.cost + action.cost;

          const newNode = {
            state: nextState,
            cost: nextCost,
            action: action,
            parent: currentNode
          };

          openList.push(newNode);
        }
      }
    }

    if (!cheapestSolution) return [];

    const plan = [];
    let curr = cheapestSolution;
    while (curr && curr.action) {
      plan.push(curr.action);
      curr = curr.parent;
    }

    return plan.reverse();
  }

  satisfiesGoal(state, goalState) {
    for (const [key, value] of goalState) {
      if (state.get(key) !== value) {
        return false;
      }
    }
    return true;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GOAPAction, GOAPPlanner };
}
