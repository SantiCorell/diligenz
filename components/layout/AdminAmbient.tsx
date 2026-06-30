/** Fondo ambiental del panel admin — blobs suaves de marca. */
export default function AdminAmbient() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="admin-ambient-blob admin-ambient-blob--primary" />
      <div className="admin-ambient-blob admin-ambient-blob--lavender" />
      <div className="admin-ambient-blob admin-ambient-blob--mint" />
    </div>
  );
}
