export default function PDISection({ pdi }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Plano de Desenvolvimento Individual
      </p>

      <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-8">
        Próximos 90 dias
      </h3>

      <div className="space-y-8">
        {pdi.map((item) => (
          <div
            key={item.competency}
            className="border border-slate-200 rounded-2xl p-6"
          >
            <h4 className="text-xl font-bold">
              {item.competency}
            </h4>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div>
                <h5 className="font-semibold mb-3">
                  30 dias
                </h5>

                <ul className="space-y-2 text-sm">
                  {item.actions.days30.map((action) => (
                    <li key={action}>• {action}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold mb-3">
                  60 dias
                </h5>

                <ul className="space-y-2 text-sm">
                  {item.actions.days60.map((action) => (
                    <li key={action}>• {action}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold mb-3">
                  90 dias
                </h5>

                <ul className="space-y-2 text-sm">
                  {item.actions.days90.map((action) => (
                    <li key={action}>• {action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}