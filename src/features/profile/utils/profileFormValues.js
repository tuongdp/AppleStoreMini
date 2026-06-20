import provinces from "@/data/province.json";

const provinceOptions = Object.values(provinces).map((p) => ({
    code: p.code,
    label: p.name_with_type,
}));

function parseAddress(address) {
    if (!address) return { province: "", ward: "", streetAddress: "" };
    const parts = address.split(",").map((s) => s.trim());
    if (parts.length >= 3) {
        const provinceName = parts[parts.length - 1];
        const wardName = parts[parts.length - 2];
        const street = parts.slice(0, -2).join(", ");
        const province = provinceOptions.find((p) => p.label === provinceName)?.code || "";
        return { province, ward: "", streetAddress: street };
    }
    if (parts.length === 2) {
        const provinceName = parts[1];
        const province = provinceOptions.find((p) => p.label === provinceName)?.code || "";
        return { province, ward: "", streetAddress: parts[0] };
    }
    return { province: "", ward: "", streetAddress: address };
}

export function getProfileFormDefaults(user) {
    const addr = parseAddress(user?.address || "");
    return {
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        province: addr.province,
        ward: addr.ward,
        streetAddress: addr.streetAddress,
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
