import { useTranslation as useT } from "@/providers/I18nProvider";
import { t as directT } from "@/i18n/index";

const useTranslation = (ns) => useT(ns);

export default useTranslation;
export { useTranslation, directT as t };
