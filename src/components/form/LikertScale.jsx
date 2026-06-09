const options = [
  { value: 1, label: "Nunca" },
  { value: 2, label: "Raramente" },
  { value: 3, label: "Às vezes" },
  { value: 4, label: "Frequentemente" },
  { value: 5, label: "Sempre" },
];

export default function LikertScale({ value, onChange }) {
  return (
    <div className="grid grid-cols-5 gap-2 mt-4">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            padding: "12px",
            borderRadius: "12px",
            border: value === option.value ? "2px solid #7c3aed" : "1px solid #ddd",
            background: value === option.value ? "#7c3aed" : "#fff",
            color: value === option.value ? "#fff" : "#111",
            cursor: "pointer",
          }}
        >
          <strong>{option.value}</strong>
          <br />
          <small>{option.label}</small>
        </button>
      ))}
    </div>
  );
}