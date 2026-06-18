export default function DesignerProfileCard({ profile }) {
  if (!profile) return null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Perfil do Respondente
      </p>

      <h2 className="text-3xl font-bold text-slate-900 mt-3">
        {profile.name}
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mt-6 text-sm">
        <div>
          <span className="text-slate-500">Idade</span>
          <p className="font-semibold">{profile.age} anos</p>
        </div>

        <div>
          <span className="text-slate-500">Experiência</span>
          <p className="font-semibold">{profile.experience}</p>
        </div>

        <div>
          <span className="text-slate-500">Cargo atual</span>
          <p className="font-semibold">{profile.currentRole}</p>
        </div>

        <div>
          <span className="text-slate-500">Nível profissional</span>
          <p className="font-semibold">{profile.professionalLevel}</p>
        </div>

        <div>
          <span className="text-slate-500">Área principal</span>
          <p className="font-semibold">{profile.mainArea}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <span className="text-slate-500 text-sm">
            Objetivo profissional para os próximos 12 meses
          </span>
          <p className="text-slate-800 mt-1">{profile.careerGoal}</p>
        </div>

        <div>
          <span className="text-slate-500 text-sm">
            Maior desafio profissional atual
          </span>
          <p className="text-slate-800 mt-1">{profile.currentChallenge}</p>
        </div>
      </div>
    </div>
  );
}