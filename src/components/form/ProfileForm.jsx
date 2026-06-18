import { useState } from "react";

export default function ProfileForm({ onSubmit }) {
  const [profile, setProfile] = useState({
    name: "",
    age: "",
    experience: "",
    currentRole: "",
    professionalLevel: "",
    mainArea: "",
    careerGoal: "",
    currentChallenge: "",
  });

  function handleChange(field, value) {
    setProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const requiredFields = [
      "name",
      "age",
      "experience",
      "currentRole",
      "professionalLevel",
      "mainArea",
      "careerGoal",
      "currentChallenge",
    ];

    const hasEmptyField = requiredFields.some((field) => !profile[field]);

    if (hasEmptyField) {
      alert("Preencha todos os campos antes de continuar.");
      return;
    }

    onSubmit(profile);
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 shadow-sm"
      >
        <p className="text-sm uppercase tracking-widest text-violet-600 font-semibold">
          Conhecendo você
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-3">
          Antes de começar seu Raio-X
        </h1>

        <p className="text-slate-600 mt-3">
          Essas informações ajudam a contextualizar sua análise e tornar o relatório mais útil para sua realidade profissional.
        </p>

        <div className="grid md:grid-cols-2 gap-5 mt-8">
          <input
            placeholder="Nome completo"
            value={profile.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          />

          <input
            placeholder="Idade"
            type="number"
            value={profile.age}
            onChange={(e) => handleChange("age", e.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          />

          <input
            placeholder="Tempo de experiência em Design"
            value={profile.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          />

          <input
            placeholder="Cargo atual"
            value={profile.currentRole}
            onChange={(e) => handleChange("currentRole", e.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          />

          <select
            value={profile.professionalLevel}
            onChange={(e) => handleChange("professionalLevel", e.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          >
            <option value="">Nível profissional percebido</option>
            <option>Júnior</option>
            <option>Pleno</option>
            <option>Sênior</option>
            <option>Especialista</option>
            <option>Líder</option>
            <option>Gestor</option>
          </select>

          <select
            value={profile.mainArea}
            onChange={(e) => handleChange("mainArea", e.target.value)}
            className="rounded-xl border border-slate-200 p-3"
          >
            <option value="">Área principal de atuação</option>
            <option>Pesquisa</option>
            <option>UX</option>
            <option>UI</option>
            <option>Product Design</option>
            <option>Design System</option>
            <option>Liderança</option>
            <option>Generalista</option>
            <option>Outro</option>
          </select>
        </div>

        <textarea
          placeholder="Qual é seu principal objetivo profissional nos próximos 12 meses?"
          value={profile.careerGoal}
          onChange={(e) => handleChange("careerGoal", e.target.value)}
          rows={4}
          className="mt-5 w-full rounded-xl border border-slate-200 p-3"
        />

        <textarea
          placeholder="Qual é seu maior desafio profissional atualmente?"
          value={profile.currentChallenge}
          onChange={(e) => handleChange("currentChallenge", e.target.value)}
          rows={4}
          className="mt-5 w-full rounded-xl border border-slate-200 p-3"
        />

        <button
          type="submit"
          className="mt-6 px-6 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition"
        >
          Continuar para o questionário
        </button>
      </form>
    </section>
  );
}