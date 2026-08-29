/**
 * Aetheria Engine - Behavior Tree AI Engine
 * Full hierarchical behavior tree implementation (Selector, Sequence, Decorator,
 * Inverter, Action, Condition) returning SUCCESS, FAILURE, or RUNNING status codes.
 */

const NodeStatus = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  RUNNING: 'RUNNING'
};

class BTNode {
  tick(blackboard) {
    return NodeStatus.FAILURE;
  }
}

class BTSelector extends BTNode {
  constructor(children = []) {
    super();
    this.children = children;
  }

  tick(blackboard) {
    for (const child of this.children) {
      const status = child.tick(blackboard);
      if (status !== NodeStatus.FAILURE) {
        return status;
      }
    }
    return NodeStatus.FAILURE;
  }
}

class BTSequence extends BTNode {
  constructor(children = []) {
    super();
    this.children = children;
  }

  tick(blackboard) {
    for (const child of this.children) {
      const status = child.tick(blackboard);
      if (status !== NodeStatus.SUCCESS) {
        return status;
      }
    }
    return NodeStatus.SUCCESS;
  }
}

class BTInverter extends BTNode {
  constructor(child) {
    super();
    this.child = child;
  }

  tick(blackboard) {
    const status = this.child.tick(blackboard);
    if (status === NodeStatus.SUCCESS) return NodeStatus.FAILURE;
    if (status === NodeStatus.FAILURE) return NodeStatus.SUCCESS;
    return status;
  }
}

class BTCondition extends BTNode {
  constructor(conditionFn) {
    super();
    this.conditionFn = conditionFn;
  }

  tick(blackboard) {
    return this.conditionFn(blackboard) ? NodeStatus.SUCCESS : NodeStatus.FAILURE;
  }
}

class BTAction extends BTNode {
  constructor(actionFn) {
    super();
    this.actionFn = actionFn;
  }

  tick(blackboard) {
    return this.actionFn(blackboard);
  }
}

class BehaviorTree {
  constructor(rootNode) {
    this.root = rootNode;
    this.blackboard = {};
  }

  tick(contextData = {}) {
    Object.assign(this.blackboard, contextData);
    if (this.root) {
      return this.root.tick(this.blackboard);
    }
    return NodeStatus.FAILURE;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    NodeStatus, BTNode, BTSelector, BTSequence, BTInverter, BTCondition, BTAction, BehaviorTree
  };
}
