export default function StrengthsSection({
  strengths,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Principais Forças
      </h3>

      <div className="space-y-4">
        {strengths.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b border-slate-100 pb-3"
          >
            <span>{item.name}</span>

            <span className="font-semibold">
              {item.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}