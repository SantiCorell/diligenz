type Props = {
  className?: string;
};

/** Marca Diligenz (solo la D) en verde, sin el panel lateral. */
export default function DiligenzMark({ className = "h-32 w-32" }: Props) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        fill="#6B9E2E"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M36 10h46c6.6 0 12 5.4 12 12v14c0 2.2-1.8 4-4 4H48v12h30c2.2 0 4 1.8 4 4v20c0 2.2-1.8 4-4 4H48v12h34c2.2 0 4 1.8 4 4v14c0 6.6-5.4 12-12 12H36c-4.4 0-8-3.6-8-8V58h14V42H28V18c0-4.4 3.6-8 8-8Zm12 32h22v16H48V42Z"
      />
    </svg>
  );
}
