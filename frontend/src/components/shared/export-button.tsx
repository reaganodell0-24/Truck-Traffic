"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToCSV } from "@/lib/export";

interface ExportButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename: string;
}

export function ExportButton({ data, filename }: ExportButtonProps) {
  if (!data || data.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-input bg-background px-2 py-1 text-xs font-medium shadow-xs hover:bg-accent hover:text-accent-foreground h-7 cursor-pointer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
        </svg>
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => exportToExcel(data, filename)}>
          Export Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToCSV(data, filename)}>
          Export CSV (.csv)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
