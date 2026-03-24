import Peer, { DataConnection } from 'peerjs';
import { create } from 'zustand';

// Message types for P2P communication
export type NetworkMessage =
  | { type: 'player-join'; playerName: string; peerId: string }
  | { type: 'player-list'; players: NetworkPlayer[] }
  | { type: 'game-start'; playerNames: string[] }
  | { type: 'game-action'; action: string; payload: unknown }
  | { type: 'game-state'; state: unknown }
  | { type: 'player-left'; peerId: string };

export interface NetworkPlayer {
  peerId: string;
  name: string;
  isHost: boolean;
}

interface NetworkState {
  peer: Peer | null;
  peerId: string | null;
  roomCode: string | null;
  isHost: boolean;
  isConnected: boolean;
  players: NetworkPlayer[];
  error: string | null;

  // Actions
  hostRoom: (playerName: string) => Promise<string>;
  joinRoom: (roomCode: string, playerName: string) => Promise<void>;
  broadcast: (message: NetworkMessage) => void;
  sendToHost: (message: NetworkMessage) => void;
  disconnect: () => void;
  onMessage: (handler: (message: NetworkMessage, fromPeerId: string) => void) => void;
  clearError: () => void;
}

// Store connections (host keeps all, guest keeps one to host)
let connections: Map<string, DataConnection> = new Map();
let messageHandler: ((message: NetworkMessage, fromPeerId: string) => void) | null = null;

// Generate a short room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const useNetworkStore = create<NetworkState>((set, get) => ({
  peer: null,
  peerId: null,
  roomCode: null,
  isHost: false,
  isConnected: false,
  players: [],
  error: null,

  hostRoom: async (playerName: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const roomCode = generateRoomCode();
      const peerId = `barcadia-${roomCode}`;

      const peer = new Peer(peerId);

      peer.on('open', (id) => {
        const hostPlayer: NetworkPlayer = {
          peerId: id,
          name: playerName,
          isHost: true,
        };

        set({
          peer,
          peerId: id,
          roomCode,
          isHost: true,
          isConnected: true,
          players: [hostPlayer],
          error: null,
        });

        resolve(roomCode);
      });

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          connections.set(conn.peer, conn);

          conn.on('data', (data) => {
            const message = data as NetworkMessage;

            // Host handles player joins
            if (message.type === 'player-join') {
              const newPlayer: NetworkPlayer = {
                peerId: message.peerId,
                name: message.playerName,
                isHost: false,
              };

              const updatedPlayers = [...get().players, newPlayer];
              set({ players: updatedPlayers });

              // Broadcast updated player list to all
              get().broadcast({ type: 'player-list', players: updatedPlayers });
            }

            // Forward other messages to handler
            if (messageHandler) {
              messageHandler(message, conn.peer);
            }
          });

          conn.on('close', () => {
            connections.delete(conn.peer);
            const updatedPlayers = get().players.filter(p => p.peerId !== conn.peer);
            set({ players: updatedPlayers });
            get().broadcast({ type: 'player-list', players: updatedPlayers });
          });
        });
      });

      peer.on('error', (err) => {
        set({ error: `Connection error: ${err.message}` });
        reject(err);
      });
    });
  },

  joinRoom: async (roomCode: string, playerName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const peer = new Peer();

      peer.on('open', (id) => {
        const hostPeerId = `barcadia-${roomCode.toUpperCase()}`;
        const conn = peer.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          connections.set(hostPeerId, conn);

          // Send join message to host
          conn.send({
            type: 'player-join',
            playerName,
            peerId: id,
          } as NetworkMessage);

          set({
            peer,
            peerId: id,
            roomCode: roomCode.toUpperCase(),
            isHost: false,
            isConnected: true,
            error: null,
          });

          resolve();
        });

        conn.on('data', (data) => {
          const message = data as NetworkMessage;

          // Update player list when received
          if (message.type === 'player-list') {
            set({ players: message.players });
          }

          // Forward to handler
          if (messageHandler) {
            messageHandler(message, hostPeerId);
          }
        });

        conn.on('close', () => {
          connections.clear();
          set({
            isConnected: false,
            error: 'Disconnected from host',
          });
        });

        conn.on('error', (err) => {
          set({ error: `Connection error: ${err.message}` });
          reject(err);
        });
      });

      peer.on('error', (err) => {
        if (err.type === 'peer-unavailable') {
          set({ error: 'Room not found. Check the code and try again.' });
        } else {
          set({ error: `Connection error: ${err.message}` });
        }
        reject(err);
      });
    });
  },

  broadcast: (message: NetworkMessage) => {
    connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  },

  sendToHost: (message: NetworkMessage) => {
    const { roomCode } = get();
    if (!roomCode) return;

    const hostPeerId = `barcadia-${roomCode}`;
    const conn = connections.get(hostPeerId);
    if (conn?.open) {
      conn.send(message);
    }
  },

  disconnect: () => {
    const { peer } = get();
    connections.forEach(conn => conn.close());
    connections.clear();
    peer?.destroy();

    set({
      peer: null,
      peerId: null,
      roomCode: null,
      isHost: false,
      isConnected: false,
      players: [],
      error: null,
    });
  },

  onMessage: (handler) => {
    messageHandler = handler;
  },

  clearError: () => {
    set({ error: null });
  },
}));
