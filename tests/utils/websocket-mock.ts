import type { Page } from "@playwright/test";

export async function installSocketIoMock(page: Page) {
  await page.addInitScript(() => {
    const listeners = new Map<string, Function[]>();
    const socket = {
      connected: true,
      id: "socket-e2e",
      on(event: string, cb: Function) {
        listeners.set(event, [...(listeners.get(event) || []), cb]);
        return socket;
      },
      off(event: string) {
        listeners.delete(event);
        return socket;
      },
      emit(event: string, payload: unknown) {
        (listeners.get(event) || []).forEach((cb) => cb(payload));
        return socket;
      },
      disconnect() {
        socket.connected = false;
        (listeners.get("disconnect") || []).forEach((cb) => cb("io client disconnect"));
      },
    };
    (window as any).__e2eSocket = socket;
  });
}
