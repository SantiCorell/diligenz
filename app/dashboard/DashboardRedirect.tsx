"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Role = "SELLER" | "BUYER" | "ADMIN";

const ROLE_TARGET: Record<Role, string> = {
  SELLER: "/dashboard/seller",
  BUYER: "/dashboard/buyer",
  ADMIN: "/admin",
};

export default function DashboardRedirect({ role }: { role: Role }) {
  const router = useRouter();
  const target = ROLE_TARGET[role] ?? "/login";

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return (
    <div className="flex items-center justify-center min-h-[200px] text-[var(--foreground)]/70">
      Redirigiendo…
    </div>
  );
}
