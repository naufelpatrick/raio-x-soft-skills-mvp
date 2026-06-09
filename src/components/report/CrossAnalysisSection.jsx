export default function CrossAnalysisSection({ items }) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Leituras Comportamentais
      </p>

      <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-6">
        Cruzamentos identificados
      </h3>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 p-5 bg-slate-50"
          >
            <h4 className="font-bold text-slate-900">
              {item.title}
            </h4>

            <p className="text-slate-600 mt-3 leading-relaxed text-sm">
              {item.interpretation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}