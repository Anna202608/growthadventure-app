import { useEffect, useState } from "react";
import { getAppLang, LANG_EVENT, setAppLang } from "../language.js";

export function useAppLang() {
  const [lang, setLang] = useState(getAppLang);

  useEffect(() => {
    const bump = () => setLang(getAppLang());
    window.addEventListener(LANG_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(LANG_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  return [lang, setAppLang];
}
