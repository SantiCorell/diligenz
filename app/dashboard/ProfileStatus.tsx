import Link from "next/link";

type Props = {
  emailVerified: boolean;
  ndaSigned: boolean;
  dniVerified: boolean;
  profileComplete: boolean;
};

export default function ProfileStatus({
  emailVerified,
  ndaSigned,
  dniVerified,
  profileComplete,
}: Props) {
  const items = [
    { label: "Email verificado", ok: emailVerified },
    { label: "NDA firmado", ok: ndaSigned, action: "/dashboard/nda" },
    { label: "DNI validado", ok: dniVerified, action: "/dashboard/verification" },
    { label: "Perfil completo", ok: profileComplete, action: "/dashboard/profile" },
  ];

  const completed = items.filter(i => i.ok).length;
  const progress = Math.round((completed / items.length) * 100);

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h2 className="text-lg font-semibold mb-4">👤 Mi perfil</h2>

      <ul className="space-y-3 text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {item.ok ? "✅" : "⬜"} {item.label}
            </span>

            {!item.ok && item.action && (
              <Link
                href={item.action}
                className="text-xs font-medium text-black hover:underline"
              >
                Completar
              </Link>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 text-xs text-gray-500">
        Progreso: {progress}%
        <div className="mt-1 h-2 w-full rounded bg-gray-200">
          <div
            className="h-2 rounded bg-black"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
