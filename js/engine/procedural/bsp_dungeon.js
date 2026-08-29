/**
 * Aetheria Engine - Binary Space Partitioning (BSP) Dungeon Generator
 * Recursive tree partitioning algorithm creating room chambers, corridors,
 * door placement, and level bounds.
 */

class BSPNode {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.leftChild = null;
    this.rightChild = null;
    this.room = null;
  }

  split(minRoomSize = 6) {
    if (this.leftChild || this.rightChild) return false;

    // Determine split direction
    let splitH = Math.random() >= 0.5;
    if (this.width > this.height && this.width / this.height >= 1.25) {
      splitH = false; // Split vertically
    } else if (this.height > this.width && this.height / this.width >= 1.25) {
      splitH = true;  // Split horizontally
    }

    const max = (splitH ? this.height : this.width) - minRoomSize;
    if (max <= minRoomSize) return false;

    const splitPos = Math.floor(minRoomSize + Math.random() * (max - minRoomSize));

    if (splitH) {
      this.leftChild = new BSPNode(this.x, this.y, this.width, splitPos);
      this.rightChild = new BSPNode(this.x, this.y + splitPos, this.width, this.height - splitPos);
    } else {
      this.leftChild = new BSPNode(this.x, this.y, splitPos, this.height);
      this.rightChild = new BSPNode(this.x + splitPos, this.y, this.width - splitPos, this.height);
    }

    return true;
  }

  createRooms(minRoomSize = 4) {
    if (this.leftChild || this.rightChild) {
      if (this.leftChild) this.leftChild.createRooms(minRoomSize);
      if (this.rightChild) this.rightChild.createRooms(minRoomSize);
    } else {
      const roomW = Math.floor(minRoomSize + Math.random() * (this.width - minRoomSize - 1));
      const roomH = Math.floor(minRoomSize + Math.random() * (this.height - minRoomSize - 1));
      const roomX = Math.floor(this.x + 1 + Math.random() * (this.width - roomW - 1));
      const roomY = Math.floor(this.y + 1 + Math.random() * (this.height - roomH - 1));

      this.room = { x: roomX, y: roomY, width: roomW, height: roomH };
    }
  }

  getRoom() {
    if (this.room) return this.room;
    let lRoom = this.leftChild ? this.leftChild.getRoom() : null;
    let rRoom = this.rightChild ? this.rightChild.getRoom() : null;
    if (!lRoom && !rRoom) return null;
    if (!lRoom) return rRoom;
    if (!rRoom) return lRoom;
    return Math.random() < 0.5 ? lRoom : rRoom;
  }
}

class BSPDungeonGenerator {
  constructor(width = 60, height = 40) {
    this.width = width;
    this.height = height;
    this.grid = [];
  }

  generate(depth = 4, minRoomSize = 5) {
    // 0 = wall, 1 = floor, 2 = corridor
    this.grid = Array.from({ length: this.height }, () => new Array(this.width).fill(0));

    const root = new BSPNode(0, 0, this.width, this.height);
    const nodes = [root];

    for (let i = 0; i < depth; i++) {
      const len = nodes.length;
      for (let j = 0; j < len; j++) {
        const node = nodes[j];
        if (node.split(minRoomSize)) {
          nodes.push(node.leftChild);
          nodes.push(node.rightChild);
        }
      }
    }

    root.createRooms(minRoomSize);
    this._carveRooms(root);
    this._carveCorridors(root);

    return this.grid;
  }

  _carveRooms(node) {
    if (!node) return;
    if (node.room) {
      for (let y = node.room.y; y < node.room.y + node.room.height; y++) {
        for (let x = node.room.x; x < node.room.x + node.room.width; x++) {
          if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y][x] = 1;
          }
        }
      }
    }
    this._carveRooms(node.leftChild);
    this._carveRooms(node.rightChild);
  }

  _carveCorridors(node) {
    if (!node || !node.leftChild || !node.rightChild) return;

    this._carveCorridors(node.leftChild);
    this._carveCorridors(node.rightChild);

    const leftRoom = node.leftChild.getRoom();
    const rightRoom = node.rightChild.getRoom();

    if (leftRoom && rightRoom) {
      const startX = Math.floor(leftRoom.x + leftRoom.width / 2);
      const startY = Math.floor(leftRoom.y + leftRoom.height / 2);
      const endX = Math.floor(rightRoom.x + rightRoom.width / 2);
      const endY = Math.floor(rightRoom.y + rightRoom.height / 2);

      let cx = startX;
      let cy = startY;

      while (cx !== endX) {
        this.grid[cy][cx] = 2;
        cx += cx < endX ? 1 : -1;
      }
      while (cy !== endY) {
        this.grid[cy][cx] = 2;
        cy += cy < endY ? 1 : -1;
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BSPDungeonGenerator;
}
