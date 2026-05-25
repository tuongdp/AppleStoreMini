import assert from "node:assert/strict";
import test from "node:test";

import { normalizeProfileUser } from "../src/store/api/userTransforms.js";

test("profile user transform keeps auth role and form gender in frontend format", () => {
  const user = normalizeProfileUser({
    id: "admin-1",
    role: "ADMIN",
    gender: "FEMALE",
  });

  assert.equal(user.role, "admin");
  assert.equal(user.gender, "female");
});
