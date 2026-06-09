export default function RecommendationsSection({ opportunities }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Recomendações Prioritárias
      </p>

      <h3 className="text-2xl font-bold text-slate-900 mt-3 mb-6">
        Onde concentrar sua evolução agora
      </h3>

      <div className="space-y-4">
        {opportunities.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <p className="text-sm text-violet-600 font-semibold">
              Prioridade {index + 1}
            </p>

            <h4 className="text-lg font-bold text-slate-900 mt-2">
              Desenvolver {item.name}
            </h4>

            <p className="text-slate-600 mt-2 text-sm leading-relaxed">
              Sua pontuação em {item.name} indica uma oportunidade importante de desenvolvimento.
              Trabalhar essa competência pode melhorar sua maturidade profissional e ampliar seu impacto nas relações, decisões e projetos.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}