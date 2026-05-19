import { mkdir } from "node:fs/promises";

export default async function globalSetup() {
  await mkdir("test-results", { recursive: true });
}
