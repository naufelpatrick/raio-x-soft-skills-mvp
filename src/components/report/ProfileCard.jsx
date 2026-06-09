export default function ProfileCard({ profile }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
      <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
        Perfil Predominante
      </p>

      <h2 className="text-3xl font-bold text-slate-900 mt-4">
        {profile.name}
      </h2>

      <p className="text-slate-600 mt-4 leading-relaxed">
        {profile.description}
      </p>
    </div>
  );
}