const toDateInputValue = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const toLowerOption = (value) => (typeof value === "string" ? value.toLowerCase() : undefined);

export function getProfileFormDefaults(user) {
  return {
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    birthday: toDateInputValue(user?.birthday),
    gender: toLowerOption(user?.gender),
    address: user?.address || "",
  };
}

export function getProfileSubmitValues(values) {
  return {
    ...values,
    birthday: values.birthday || null,
    gender: values.gender || null,
    address: values.address || "",
  };
}
