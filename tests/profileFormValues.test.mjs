import assert from "node:assert/strict";
import test from "node:test";

import {
  getProfileFormDefaults,
  getProfileSubmitValues,
} from "../src/features/profile/utils/profileFormValues.js";

test("profile defaults normalize API gender and birthday for form controls", () => {
  const defaults = getProfileFormDefaults({
    fullName: "Nguyen Van A",
    phone: "0900000000",
    birthday: "1998-04-20T00:00:00.000Z",
    gender: "MALE",
    address: null,
  });

  assert.equal(defaults.gender, "male");
  assert.equal(defaults.birthday, "1998-04-20");
  assert.equal(defaults.address, "");
});

test("profile submit values send nullable optional fields instead of empty date strings", () => {
  const payload = getProfileSubmitValues({
    fullName: "Nguyen Van A",
    phone: "0900000000",
    birthday: "",
    gender: undefined,
    address: "",
  });

  assert.equal(payload.birthday, null);
  assert.equal(payload.gender, null);
});
