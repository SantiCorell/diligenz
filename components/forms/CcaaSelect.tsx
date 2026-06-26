import { SPAIN_CCAA_OPTIONS } from "@/lib/spain-ccaa";

type Props = {
  id?: string;
  name?: string;
  required?: boolean;
  value?: string;
  className?: string;
};

export default function CcaaSelect({
  id = "location",
  name = "location",
  required = false,
  value = "",
  className = "mt-2 w-full rounded-xl border-2 border-[var(--brand-primary)]/20 px-4 py-2.5 text-[var(--foreground)] focus:border-[var(--brand-primary)] focus:outline-none",
}: Props) {
  return (
    <select id={id} name={name} required={required} defaultValue={value} className={className}>
      {SPAIN_CCAA_OPTIONS.map((opt) => (
        <option key={opt.value || "empty"} value={opt.value} disabled={opt.value === "" && required}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
