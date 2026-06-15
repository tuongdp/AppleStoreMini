export function getProfileFormDefaults(user) {
  return {
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    province: "",
    ward: "",
    streetAddress: "",
  };
}

export function getProfileSubmitValues(values, wardName, provinceName) {
  const address = `${values.streetAddress}, ${wardName || ""}, ${provinceName || ""}`;
  return {
    fullName: values.fullName,
    phone: values.phone,
    address,
  };
}
