/**
 * Aetheria Studio - Visual Script Node Trigger Editor
 * Node-based visual scripting graph (OnEvent -> Condition -> Action) for game modding.
 */

class ScriptNode {
  constructor(id, title, type, x = 100, y = 100) {
    this.id = id;
    this.title = title;
    this.type = type; // 'event', 'condition', 'action'
    this.x = x;
    this.y = y;
    this.inputs = [];
    this.outputs = [];
  }
}

class ScriptNodeEditor {
  constructor() {
    this.nodes = [];
    this.connections = [];
  }

  createNode(title, type, x, y) {
    const node = new ScriptNode(`node_${Date.now()}_${Math.floor(Math.random() * 1000)}`, title, type, x, y);
    this.nodes.push(node);
    return node;
  }

  connect(fromNodeId, fromOutputIdx, toNodeId, toInputIdx) {
    this.connections.push({
      fromNodeId,
      fromOutputIdx,
      toNodeId,
      toInputIdx
    });
  }

  compileToJSON() {
    return JSON.stringify({
      nodes: this.nodes,
      connections: this.connections
    }, null, 2);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ScriptNode, ScriptNodeEditor };
}
