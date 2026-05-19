import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { mockApi } from "../utils/route-mocks";
import { waitForAppReady } from "../utils/waits";

type Fixtures = {
  mockedPage: Page;
};

export const test = base.extend<Fixtures>({
  mockedPage: async ({ page }, use) => {
    await mockApi(page);
    await use(page);
  },
});

export { expect, waitForAppReady };
