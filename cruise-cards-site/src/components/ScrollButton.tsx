"use client";

type Props = {
  targetId: string;
  label: string;
  className?: string;
};

export default function ScrollButton({ targetId, label, className }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      {label}
    </button>
  );
}
