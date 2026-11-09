"use client";
import { useEffect } from "react";
import { syncVendorMode } from "@/app/actions/mode";

/** Remembers vendor view when a vendor page was opened directly, such as from a notification. */
export function ModeSync() {
  useEffect(() => { void syncVendorMode(); }, []);
  return null;
}
