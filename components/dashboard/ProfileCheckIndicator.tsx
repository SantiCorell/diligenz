export type ProfileCheckState = "done" | "pending" | "todo";

export default function ProfileCheckIndicator({ state }: { state: ProfileCheckState }) {
  if (state === "done") {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-primary)]/10"
        aria-hidden
      >
        <span className="text-sm font-bold leading-none text-[var(--brand-primary)]">✓</span>
      </span>
    );
  }

  if (state === "pending") {
    return (
      <span
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100"
        aria-hidden
      >
        <span className="h-2 w-2 rounded-full bg-amber-500" />
      </span>
    );
  }

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[var(--brand-primary)]/15 bg-white"
      aria-hidden
    />
  );
}
