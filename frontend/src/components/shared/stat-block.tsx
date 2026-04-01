export function StatBlock({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-right">
      <div className="text-lg font-mono font-bold text-foreground">{value}</div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
