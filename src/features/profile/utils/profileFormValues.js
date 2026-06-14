export function getProfileFormDefaults(user) {
  return {
    fullName: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  };
}

export function getProfileSubmitValues(values) {
  return {
    ...values,
    address: values.address || "",
  };
}
