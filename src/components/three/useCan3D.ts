"use client";
import { useEffect, useState } from "react";

/** WebGL available and the user hasn't asked for reduced motion. */
export function useCan3D() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    try {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      setOk(!!gl);
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}
