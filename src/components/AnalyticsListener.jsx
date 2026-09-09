import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../analytics.js";

export default function AnalyticsListener() {
  const location = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    const path = `${location.pathname}${location.search}${location.hash}`;
    trackPageView(path || "/");
  }, [location.pathname, location.search, location.hash]);

  return null;
}
