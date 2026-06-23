import { createClient, type RealtimeChannel } from "@supabase/supabase-js";
import type {
  GameState,
  OnlineLobbyPlayer,
  OnlineSession,
} from "../types/game";

type LobbyPayload = {
  roomCode: string;
  players: OnlineLobbyPlayer[];
  hostId: string;
  started: boolean;
};

type LobbyHandlers = {
  onLobbyState?: (state: LobbyPayload) => void;
  onStartGame?: (game: GameState) => void;
  onJoinRequest?: (player: OnlineLobbyPlayer) => void;
};

type GameHandlers = {
  onGameState?: (game: GameState) => void;
  onRequestState?: (playerId: string) => void;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as
  | string
  | undefined;

const client =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

console.log(
  client
    ? "Supabase Realtime is configured."
    : "Supabase Realtime is not configured.",
);

console.log(supabaseUrl, supabaseAnonKey);

export function isRealtimeConfigured() {
  return Boolean(client);
}

export function createPlayerId() {
  // Use native crypto.randomUUID if available; otherwise fall back to a simple pseudo‑UUID generator.
  const uuid = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : [...Array(16)]
        .map(() => Math.random().toString(36).charAt(2))
        .join("");
  return `p_${uuid.replace(/-/g, "").slice(0, 10)}`;
}

export function createRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  return code;
}

export function normalizeRoomCode(value: string) {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 8);
}

export function makeLobbyPlayer(session: OnlineSession): OnlineLobbyPlayer {
  return {
    id: session.playerId,
    name: session.playerName,
    joinedAt: new Date().toISOString(),
  };
}

export async function openLobbyChannel(
  session: OnlineSession,
  handlers: LobbyHandlers,
): Promise<RealtimeChannel> {
  if (!client) {
    throw new Error("Supabase Realtime is not configured.");
  }

  const channel = client.channel(`tlmb-lobby-${session.roomCode}`, {
    config: { broadcast: { self: false } },
  });

  channel
    .on("broadcast", { event: "lobby-state" }, ({ payload }) => {
      handlers.onLobbyState?.(payload as LobbyPayload);
    })
    .on("broadcast", { event: "start-game" }, ({ payload }) => {
      handlers.onStartGame?.(payload as GameState);
    })
    .on("broadcast", { event: "join-request" }, ({ payload }) => {
      handlers.onJoinRequest?.(payload as OnlineLobbyPlayer);
    });

  await subscribe(channel);

  if (!session.isHost) {
    await channel.send({
      type: "broadcast",
      event: "join-request",
      payload: makeLobbyPlayer(session),
    });
  }

  return channel;
}

export async function broadcastLobbyState(
  channel: RealtimeChannel,
  state: LobbyPayload,
) {
  await channel.send({
    type: "broadcast",
    event: "lobby-state",
    payload: state,
  });
}

export async function broadcastStartGame(
  channel: RealtimeChannel,
  game: GameState,
) {
  await channel.send({ type: "broadcast", event: "start-game", payload: game });
}

export async function openGameChannel(
  session: OnlineSession,
  handlers: GameHandlers,
): Promise<RealtimeChannel> {
  if (!client) {
    throw new Error("Supabase Realtime is not configured.");
  }

  const channel = client.channel(`tlmb-game-${session.roomCode}`, {
    config: { broadcast: { self: false } },
  });

  channel
    .on("broadcast", { event: "game-state" }, ({ payload }) => {
      handlers.onGameState?.(payload as GameState);
    })
    .on("broadcast", { event: "request-state" }, ({ payload }) => {
      handlers.onRequestState?.((payload as { playerId: string }).playerId);
    });

  await subscribe(channel);

  await channel.send({
    type: "broadcast",
    event: "request-state",
    payload: { playerId: session.playerId },
  });

  return channel;
}

export async function broadcastGameState(
  channel: RealtimeChannel,
  game: GameState,
) {
  await channel.send({ type: "broadcast", event: "game-state", payload: game });
}

export async function closeRealtimeChannel(channel: RealtimeChannel | null) {
  if (!client || !channel) return;
  await client.removeChannel(channel);
}

function subscribe(channel: RealtimeChannel) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(
      () => reject(new Error("Realtime connection timed out.")),
      10000,
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        window.clearTimeout(timeout);
        resolve();
      }

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        window.clearTimeout(timeout);
        reject(
          new Error(
            `Realtime channel ${status.toLowerCase().replace("_", " ")}.`,
          ),
        );
      }
    });
  });
}
