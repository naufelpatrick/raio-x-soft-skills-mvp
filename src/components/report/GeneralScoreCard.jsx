export default function GeneralScoreCard({
  score,
  level,
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Índice Geral
      </p>

      <h2 className="text-6xl font-bold text-slate-900 mt-3">
        {score}
      </h2>

      <p className="text-xl text-slate-600 mt-3">
        {level}
      </p>
    </div>
  );
}