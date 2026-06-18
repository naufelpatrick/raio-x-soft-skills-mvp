const periods = [
  { key: "days30", label: "30 dias" },
  { key: "days60", label: "60 dias" },
  { key: "days90", label: "90 dias" },
];

export default function PDISection({ pdi }) {
  if (!pdi?.length) return null;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Plano de Desenvolvimento Individual
      </p>

      <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-2">
        Próximos 90 dias
      </h3>

      <p className="text-slate-600 mb-8">
        Ações práticas para desenvolver suas três competências prioritárias.
      </p>

      <div className="space-y-8">
        {pdi.map((item) => (
          <article
            key={item.competency}
            className="border border-slate-200 rounded-2xl p-6"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-xl font-bold text-slate-900">
                {item.competency}
              </h4>
              <span className="text-sm font-semibold text-violet-600">
                Score {item.score}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {periods.map((period) => (
                <div key={period.key}>
                  <h5 className="font-semibold text-slate-900 mb-3">
                    {period.label}
                  </h5>

                  <ul className="space-y-2 text-sm text-slate-600">
                    {item.actions[period.key].map((action) => (
                      <li key={action} className="flex gap-2">
                        <span aria-hidden="true" className="text-violet-600">
                          •
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
