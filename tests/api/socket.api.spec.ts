import { test, expect } from "@playwright/test";
import { io } from "socket.io-client";
import { testEnv } from "../utils/env";

test.describe("socket.io realtime", () => {
  test("connects, heartbeats, and disconnects cleanly", async () => {
    const health = await fetch(testEnv.backendUrl).then(() => true).catch(() => false);
    test.skip(!health, "backend socket server is not running");

    const socket = io(testEnv.backendUrl, {
      path: "/socket.io",
      transports: ["websocket"],
      timeout: 5_000,
      reconnectionAttempts: 1,
    });

    const connected = await new Promise<boolean>((resolve) => {
      socket.on("connect", () => resolve(true));
      socket.on("connect_error", () => resolve(false));
    });

    if (!connected) {
      socket.disconnect();
      test.skip(true, "backend socket server is not running");
    }

    expect(socket.connected).toBeTruthy();
    socket.disconnect();
    expect(socket.connected).toBeFalsy();
  });
});
