"use client";

import { usePathname } from "next/navigation";

export default function HideOnServicios({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/dashboard/servicios")) return null;
  return children;
}
