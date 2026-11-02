"use client";

import { useEffect } from "react";

export default function LiveReloadListener() {
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const bc = new BroadcastChannel("cms_live_sync");
      bc.onmessage = (event) => {
        if (event.data?.type === "PUBLISHED") {
          // If this page is in live mode (not in active editor), reload fresh content
          const params = new URLSearchParams(window.location.search);
          if (params.get("editor") !== "true") {
            window.location.reload();
          }
        }
      };
      return () => {
        try {
          bc.close();
        } catch (e) {}
      };
    } catch (e) {}
  }, []);

  return null;
}
