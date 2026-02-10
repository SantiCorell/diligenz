/**
 * Valora tu empresa: acceso público, sin registro obligatorio.
 * El formulario envía a /api/valuation (crea ValuationLead; si hay sesión también crea Company).
 */
export default function SellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
