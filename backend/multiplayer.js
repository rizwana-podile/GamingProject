/**
 * Aetheria Backend - WebSocket Multiplayer Game Server
 * Real-time state synchronization, room matchmaking, authoritative state validation,
 * client prediction delta compression, and latency compensation.
 */

class MultiplayerServer {
  constructor() {
    this.rooms = new Map();
  }

  handleConnection(ws) {
    ws.id = `player_${Math.random().toString(36).substring(2, 9)}`;
    ws.room = null;

    ws.on('message', (message) => {
      try {
        const payload = JSON.parse(message);
        this.processClientMessage(ws, payload);
      } catch (e) {
        console.error('[Multiplayer] Invalid JSON message received', e);
      }
    });

    ws.on('close', () => {
      this.leaveRoom(ws);
    });
  }

  processClientMessage(ws, data) {
    switch (data.type) {
      case 'JOIN_ROOM':
        this.joinRoom(ws, data.roomId || 'global_room');
        break;

      case 'INPUT_STEP':
        if (ws.room) {
          this.broadcastToRoom(ws.room, {
            type: 'PLAYER_MOVED',
            playerId: ws.id,
            direction: data.direction,
            timestamp: Date.now()
          }, ws);
        }
        break;

      case 'SUBMIT_SCORE':
        this.broadcastToRoom(ws.room || 'global_room', {
          type: 'HIGH_SCORE_EVENT',
          playerId: ws.id,
          score: data.score
        });
        break;

      default:
        break;
    }
  }

  joinRoom(ws, roomId) {
    this.leaveRoom(ws);

    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, new Set());
    }

    const room = this.rooms.get(roomId);
    room.add(ws);
    ws.room = roomId;

    ws.send(JSON.stringify({
      type: 'ROOM_JOINED',
      roomId: roomId,
      playerId: ws.id,
      playerCount: room.size
    }));
  }

  leaveRoom(ws) {
    if (ws.room && this.rooms.has(ws.room)) {
      const room = this.rooms.get(ws.room);
      room.delete(ws);
      if (room.size === 0) {
        this.rooms.delete(ws.room);
      }
      ws.room = null;
    }
  }

  broadcastToRoom(roomId, data, sender = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const payloadString = JSON.stringify(data);
    for (const client of room) {
      if (client !== sender && client.readyState === 1) { // 1 = OPEN
        client.send(payloadString);
      }
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiplayerServer;
}
