import { likertOptions } from "../../data/questions";

export default function LikertScale({ name, value, onChange }) {
  return (
    <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-5" role="radiogroup">
      {likertOptions.map((option) => (
        <label
          key={option.value}
          className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border p-3 sm:flex-col sm:text-center ${
            value === option.value
              ? "border-violet-600 bg-violet-50 text-violet-700 ring-1 ring-violet-600"
              : "border-slate-200 text-slate-700"
          }`}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            aria-label={`${option.value} — ${option.label}`}
          />
          <strong>{option.value}</strong>
          <span className="text-xs">{option.label}</span>
          {value === option.value && <span className="sr-only">Selecionado</span>}
        </label>
      ))}
    </div>
  );
}
