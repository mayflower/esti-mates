import { type ChildProcess, spawn } from "node:child_process";
import { createServer } from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Socket, io as connectClient } from "socket.io-client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

// Starts the real server (src/server.ts) as a child process and drives it through
// socket.io. Covers the wiring in server.ts that unit tests of EventHandlers cannot
// reach — above all that currentSessionId is set from create/join, without which
// every later event (submit_estimate, reveal_cards, …) is silently dropped.

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once("error", reject);
    srv.listen(0, () => {
      const address = srv.address();
      const port = typeof address === "object" && address ? address.port : 0;
      srv.close(() => resolve(port));
    });
  });
}

async function waitForHealth(url: string, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/health`);
      if (res.ok) return;
    } catch {
      // server not up yet
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`server did not become healthy within ${timeoutMs}ms`);
}

function nextEvent<T = unknown>(socket: Socket, event: string, timeoutMs = 2_000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for "${event}"`)), timeoutMs);
    socket.once(event, (data: T) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

function connect(url: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = connectClient(url, { transports: ["websocket"], forceNew: true });
    socket.once("connect", () => resolve(socket));
    socket.once("connect_error", reject);
  });
}

describe("server integration (real socket.io server)", () => {
  let server: ChildProcess;
  let url: string;
  const sockets: Socket[] = [];

  beforeAll(async () => {
    const port = await freePort();
    url = `http://localhost:${port}`;
    server = spawn(process.execPath, ["--import", "tsx", "src/server.ts"], {
      cwd: backendDir,
      env: { ...process.env, PORT: String(port), NODE_ENV: "test" },
      stdio: "ignore",
    });
    await waitForHealth(url);
  }, 20_000);

  afterAll(() => {
    for (const s of sockets) s.close();
    server?.kill();
  });

  it("runs a full round: create, join, failed re-join, estimate, reveal", async () => {
    const alice = await connect(url);
    const bob = await connect(url);
    sockets.push(alice, bob);

    const created = nextEvent<{ sessionId: string; cardDeck: string }>(alice, "session_created");
    alice.emit("create_session", { name: "  Alice  ", cardDeck: "tshirt" });
    const { sessionId, cardDeck } = await created;
    expect(sessionId).toBeTruthy();
    expect(cardDeck).toBe("tshirt");

    const participantJoined = nextEvent<{ participant: { name: string } }>(
      alice,
      "participant_joined"
    );
    const joined = nextEvent<{ cardDeck: string }>(bob, "joined_session");
    bob.emit("join_session", { sessionId, name: "Bob" });
    expect((await joined).cardDeck).toBe("tshirt");
    expect((await participantJoined).participant.name).toBe("Bob");

    // A failed second join must not drop Bob out of the session he is already in.
    const joinError = nextEvent<{ message: string }>(bob, "error");
    bob.emit("join_session", { sessionId: "does-not-exist", name: "Bob" });
    expect((await joinError).message).toBeTruthy();

    const aliceSubmitted = nextEvent(bob, "estimate_submitted");
    alice.emit("submit_estimate", { estimate: "M" });
    await aliceSubmitted;

    const bobSubmitted = nextEvent(alice, "estimate_submitted");
    bob.emit("submit_estimate", { estimate: "L" });
    await bobSubmitted;

    const revealed = nextEvent<{ estimates: Record<string, string> }>(bob, "cards_revealed");
    alice.emit("reveal_cards");
    expect(Object.values((await revealed).estimates).sort()).toEqual(["L", "M"]);
  });
});
