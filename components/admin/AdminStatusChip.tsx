type ChipTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "featured"
  | "danger";

const TONE_CLASS: Record<ChipTone, string> = {
  neutral: "admin-chip admin-chip--neutral",
  primary: "admin-chip admin-chip--primary",
  success: "admin-chip admin-chip--success",
  warning: "admin-chip admin-chip--warning",
  featured: "admin-chip admin-chip--featured",
  danger: "admin-chip admin-chip--danger",
};

export default function AdminStatusChip({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: ChipTone;
}) {
  return <span className={TONE_CLASS[tone]}>{children}</span>;
}
