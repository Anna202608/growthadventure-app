import { useEffect, useState } from "react";
import { DATA_EVENT, ensureSeed } from "../db.js";

export function useLiveData() {
  const [, setTick] = useState(0);

  useEffect(() => {
    ensureSeed();
    const bump = () => setTick((value) => value + 1);
    window.addEventListener("storage", bump);
    window.addEventListener(DATA_EVENT, bump);
    return () => {
      window.removeEventListener("storage", bump);
      window.removeEventListener(DATA_EVENT, bump);
    };
  }, []);
}
