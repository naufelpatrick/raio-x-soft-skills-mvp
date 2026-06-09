export default function CompetencyTable({ competencies }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Competências Avaliadas
      </p>

      <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-6">
        Resultado por Competência
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3">Competência</th>
              <th className="text-center py-3">Score</th>
              <th className="text-center py-3">Nível</th>
            </tr>
          </thead>

          <tbody>
            {competencies.map((item) => (
              <tr
                key={item.id}
                className="border-b border-slate-100"
              >
                <td className="py-4">
                  {item.name}
                </td>

                <td className="text-center font-semibold">
                  {item.score}
                </td>

                <td className="text-center">
                  {item.level}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}