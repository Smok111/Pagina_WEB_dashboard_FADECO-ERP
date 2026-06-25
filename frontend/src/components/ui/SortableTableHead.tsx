import { TableHead } from "@/components/ui/table";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

interface SortableTableHeadProps {
  label: string;
  field: string;
  currentSortField: string;
  currentSortOrder: "asc" | "desc";
  onSort: (field: string) => void;
  align?: "left" | "right" | "center";
  className?: string;
}

export function SortableTableHead({
  label,
  field,
  currentSortField,
  currentSortOrder,
  onSort,
  align = "left",
  className = "",
}: SortableTableHeadProps) {
  const isActive = currentSortField === field;

  return (
    <TableHead
      className={`cursor-pointer select-none hover:bg-white/5 hover:text-white transition-colors ${
        isActive ? "text-white font-bold bg-white/5" : "text-slate-400"
      } ${
        align === "right" ? "text-right" : align === "center" ? "text-center" : ""
      } ${className}`}
      onClick={() => onSort(field)}
    >
      <div className={`flex items-center gap-1 ${
        align === "right" ? "justify-end" : align === "center" ? "justify-center" : ""
      }`}>
        {label}
        {isActive ? (
          currentSortOrder === "asc" ? (
            <ArrowUp className="h-3 w-3 text-blue-400" />
          ) : (
            <ArrowDown className="h-3 w-3 text-blue-400" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-30 group-hover:opacity-100" />
        )}
      </div>
    </TableHead>
  );
}
