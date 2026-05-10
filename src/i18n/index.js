import viText from "./viText";

const t = (key, options = {}) => {
  const ns = options.ns;
  let fullKey = key;
  if (ns && !key.includes(".")) {
    fullKey = `${ns}.${key}`;
  }

  const value = viText[fullKey];
  if (value !== undefined) return value;

  if (key.includes(".")) {
    const nsKey = ns ? `${ns}.${key}` : key;
    const nsValue = viText[nsKey];
    if (nsValue !== undefined) return nsValue;
  }

  if (options.defaultValue) return options.defaultValue;

  const parts = key.split(".");
  return parts[parts.length - 1] || key;
};

const i18nConfig = { language: "vi" };

export default { t, language: "vi", options: {} };
export { t, i18nConfig };
