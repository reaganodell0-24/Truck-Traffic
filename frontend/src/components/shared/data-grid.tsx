interface DataGridItem {
  label: string;
  value: string | number | null | undefined;
}

export function DataGrid({ items }: { items: DataGridItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            {item.label}
          </div>
          <div className="text-sm font-medium text-foreground">
            {item.value ?? "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
