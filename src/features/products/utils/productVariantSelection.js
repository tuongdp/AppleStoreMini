export const VARIANT_OPTION_FIELDS = ["color", "storage", "ram", "edition"];

const FIELD_PRIORITY = VARIANT_OPTION_FIELDS.reduce((priority, field, index) => {
  priority[field] = index;
  return priority;
}, {});

export function normalizeOptionValue(value) {
  return typeof value === "string" ? value.trim() : value || "";
}

export function isVariantAvailable(variant) {
  return Boolean(variant?.inStock) && Number(variant?.stock ?? 0) > 0;
}

function matchesSelection(variant, selection, fields = VARIANT_OPTION_FIELDS) {
  return fields.every((field) => {
    const selectedValue = normalizeOptionValue(selection?.[field]);
    if (!selectedValue) return true;
    return normalizeOptionValue(variant?.[field]) === selectedValue;
  });
}

function sortAvailableFirst(left, right) {
  return Number(isVariantAvailable(right)) - Number(isVariantAvailable(left));
}

export function getSelectedVariant(variants, selection = {}) {
  const candidates = [...(variants || [])].sort(sortAvailableFirst);
  const hasSelection = VARIANT_OPTION_FIELDS.some((field) =>
    normalizeOptionValue(selection[field]),
  );

  if (!hasSelection) {
    return candidates.find(isVariantAvailable) || candidates[0] || null;
  }

  return (
    candidates.find((variant) => isVariantAvailable(variant) && matchesSelection(variant, selection)) ||
    candidates.find((variant) => matchesSelection(variant, selection)) ||
    null
  );
}

export function isOptionSelectable(variants, field, value, selection = {}) {
  const currentPriority = FIELD_PRIORITY[field] ?? 0;
  const previousFields = VARIANT_OPTION_FIELDS.filter(
    (candidate) => FIELD_PRIORITY[candidate] < currentPriority,
  );

  return (variants || []).some(
    (variant) =>
      isVariantAvailable(variant) &&
      normalizeOptionValue(variant[field]) === normalizeOptionValue(value) &&
      matchesSelection(variant, selection, previousFields),
  );
}

export function findVariantForOption(variants, field, value, selection = {}) {
  const currentPriority = FIELD_PRIORITY[field] ?? 0;
  const nextSelection = { ...selection, [field]: value };
  const fieldsToMatch = VARIANT_OPTION_FIELDS.filter(
    (candidate) => FIELD_PRIORITY[candidate] <= currentPriority,
  );
  const candidates = [...(variants || [])].sort(sortAvailableFirst);

  return (
    candidates.find(
      (variant) => isVariantAvailable(variant) && matchesSelection(variant, nextSelection, fieldsToMatch),
    ) ||
    candidates.find((variant) => matchesSelection(variant, nextSelection, fieldsToMatch)) ||
    null
  );
}

export function getVariantSelection(variant) {
  return VARIANT_OPTION_FIELDS.reduce((selection, field) => {
    selection[field] = normalizeOptionValue(variant?.[field]);
    return selection;
  }, {});
}
