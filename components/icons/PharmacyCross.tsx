import { forwardRef } from "react";
import type { LucideIcon } from "lucide-react";

/**
 * Cruz farmacéutica: brazos gruesos y redondeados (señal verde europea),
 * misma línea geométrica y limpia que los iconos Lucide del resto de sectores.
 */
export const PharmacyCross: LucideIcon = forwardRef(
  ({ className, size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="10.15" y="4.25" width="3.7" height="15.5" rx="1.85" fill="currentColor" />
      <rect x="4.25" y="10.15" width="15.5" height="3.7" rx="1.85" fill="currentColor" />
    </svg>
  )
);

PharmacyCross.displayName = "PharmacyCross";
