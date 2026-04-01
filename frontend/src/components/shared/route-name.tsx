"use client";

export function RouteName({ name, className }: { name: string; className?: string }) {
  if (!name.includes("\u2192")) {
    return <span className={className}>{name}</span>;
  }

  const parts = name.split("\u2192");
  return (
    <span className={className}>
      {parts[0].trim()}
      <svg className="inline-block mx-1 -mt-0.5" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
      {parts.slice(1).join("").trim()}
    </span>
  );
}
