"use client";
import { useSearchParams } from "next/navigation";

export function useSafeSearchParams() {
  return useSearchParams();
}