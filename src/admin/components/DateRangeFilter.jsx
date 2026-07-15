import { adminDateRanges } from "../utils/dateRanges";

export function DateRangeFilter({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {adminDateRanges.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`rounded-sm border px-3 py-2 text-xs transition-colors ${
            value === key
              ? "border-primary bg-primary/10 text-foreground"
              : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
