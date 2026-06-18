import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function RadarChartBlock({ competencies }) {
  const data = competencies.map((item) => ({
    competency: item.name,
    score: item.score,
  }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <h3 className="text-2xl font-bold text-slate-900 mb-6">
        Radar de Soft Skills
      </h3>

      <div className="h-[420px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={0}
          minHeight={420}
          initialDimension={{ width: 800, height: 420 }}
        >
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="competency" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, 100]} />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#7c3aed"
              fill="#7c3aed"
              fillOpacity={0.25}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
