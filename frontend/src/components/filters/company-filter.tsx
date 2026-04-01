"use client";

import { useAppStore } from "@/stores/app-store";
import { COMPANY_COLORS, COMPANY_NAMES } from "@/lib/constants";
import type { Company } from "@/lib/types";
import { FilterChip } from "./filter-chip";

const companies: Company[] = ["aurora", "kodiak", "gatik", "waabi", "bot-auto"];

export function CompanyFilter() {
  const { companyFilter, setCompanyFilter } = useAppStore();

  return (
    <div className="space-y-1.5">
      <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        Operator
      </div>
      <div className="flex flex-wrap gap-1">
        <FilterChip
          label="All"
          active={companyFilter === null}
          onClick={() => setCompanyFilter(null)}
        />
        {companies.map((c) => (
          <FilterChip
            key={c}
            label={COMPANY_NAMES[c]}
            color={COMPANY_COLORS[c]}
            active={companyFilter === c}
            onClick={() => setCompanyFilter(companyFilter === c ? null : c)}
          />
        ))}
      </div>
    </div>
  );
}
