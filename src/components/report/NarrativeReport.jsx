import ReactMarkdown from "react-markdown";

export default function NarrativeReport({ report, loading, error, warning }) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <p className="text-violet-600 font-semibold">
          Gerando relatório narrativo...
        </p>
        <p className="text-slate-600 mt-2">
          Estamos analisando seus resultados e respostas abertas.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-3xl border border-red-200 p-8">
        <h3 className="text-xl font-bold text-red-700">
          Não foi possível gerar o relatório narrativo
        </h3>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Relatório Narrativo
      </p>

      {warning && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800" role="alert">
          {warning}
        </div>
      )}

      <div className="prose prose-slate max-w-none mt-6">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
    </div>
  );
}
