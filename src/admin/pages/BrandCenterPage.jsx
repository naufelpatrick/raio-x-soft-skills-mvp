import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { BookOpen, LogOut, Moon, Search, Sun } from "lucide-react";
import { fetchAdminSession, getStoredAdminSession, signOutAdmin } from "../services/adminAuthService";
import home from "../brand-content/home.mdx?raw";
import brand from "../brand-content/brand.mdx?raw";
import positioning from "../brand-content/positioning.mdx?raw";
import platform from "../brand-content/platform.mdx?raw";
import verbal from "../brand-content/verbal.mdx?raw";
import visual from "../brand-content/visual.mdx?raw";
import typography from "../brand-content/typography.mdx?raw";
import visualSystem from "../brand-content/visual-system.mdx?raw";
import applications from "../brand-content/applications.mdx?raw";
import journey from "../brand-content/journey.mdx?raw";
import principles from "../brand-content/principles.mdx?raw";
import doctrine from "../brand-content/doctrine.mdx?raw";
import avatar from "../brand-content/avatar.mdx?raw";
import editorial from "../brand-content/editorial.mdx?raw";
import growth from "../brand-content/growth.mdx?raw";

const documents = [
  { id: "home", label: "Capa", group: "Brand Book", content: home },
  { id: "brand", label: "A marca", group: "Brand Book", content: brand },
  { id: "positioning", label: "Posicionamento", group: "Brand Book", content: positioning },
  { id: "platform", label: "Plataforma da marca", group: "Brand Book", content: platform },
  { id: "verbal", label: "Identidade verbal", group: "Expressão", content: verbal },
  { id: "visual", label: "Identidade visual", group: "Expressão", content: visual },
  { id: "typography", label: "Tipografia", group: "Expressão", content: typography },
  { id: "visual-system", label: "Sistema visual", group: "Expressão", content: visualSystem },
  { id: "applications", label: "Aplicações", group: "Expressão", content: applications },
  { id: "journey", label: "Jornada do usuário", group: "Estratégia", content: journey },
  { id: "principles", label: "Princípios", group: "Estratégia", content: principles },
  { id: "doctrine", label: "Brand Doctrine", group: "Sistemas vivos", content: doctrine },
  { id: "avatar", label: "Avatar estratégico", group: "Sistemas vivos", content: avatar },
  { id: "editorial", label: "Editorial Engine", group: "Sistemas vivos", content: editorial },
  { id: "growth", label: "Growth Engine", group: "Sistemas vivos", content: growth },
];

const colors = [
  ["Azul Noturno", "#010C1B", "Principal"], ["Azul Profundo", "#0F1F31", "Secundária"],
  ["Azul Médio", "#223145", "Terciária"], ["Ouro", "#D4A139", "Destaque"],
  ["Névoa", "#EDEEF0", "Neutro"], ["Branco", "#FFFFFF", "Fundo"],
];

function VisualIdentityPanel() {
  return <div className="brand-visual-panel">
    <h2>Logo — versões</h2>
    <div className="brand-logo-grid">
      {["#010C1B", "#0F1F31", "#223145", "#D4A139"].map((background, index) => <div className={`brand-logo-card logo-${index}`} style={{ background }} key={background}><img src="/raio-x-logo-branco.svg" alt="Aplicação oficial do logo Raio X do Designer"/><span>{["Principal", "Azul profundo", "Monocromática", "Destaque"][index]}</span></div>)}
    </div>
    <h2>Paleta oficial</h2>
    <div className="brand-palette-grid">{colors.map(([name, hex, role]) => <div className="brand-swatch" key={hex}><div style={{ background: hex }}/><strong>{name}</strong><code>{hex}</code><span>{role}</span></div>)}</div>
  </div>;
}

function TypographyPanel() {
  const rows = [["Display", "64 / 800", "Clareza."], ["Heading 1", "48 / 800", "Design é decisão."], ["Heading 2", "32 / 700", "Repertório estratégico."], ["Heading 3", "22 / 600", "Clareza orienta escolhas."], ["Body Large", "18 / 400", "O raio-X revela o que é invisível a olho nu."], ["Body", "15 / 400", "Designers que entendem além das ferramentas tomam decisões melhores."], ["Caption", "12 / 300", "Versão 1.0 — Documento Institucional"], ["Label", "10 / 600", "IDENTIDADE DE MARCA · BRAND BOOK · 2026"]];
  return <div className="brand-type-panel"><div className="brand-type-hero"><span>Sora</span><p>Aa</p></div><div className="brand-weight-row">{[300,400,500,600,700,800].map(weight => <span style={{fontWeight: weight}} key={weight}>{weight}</span>)}</div><div className="brand-type-scale">{rows.map(([name, spec, sample], index) => <div key={name}><small>{name}<br/>{spec}</small><p style={{fontSize: `clamp(1rem, ${Math.max(1.1, 3.6-index*.38)}vw, ${Math.max(1,4-index*.42)}rem)`, fontWeight: Number(spec.split(" / ")[1])}}>{sample}</p></div>)}</div></div>;
}

function VisualSystemPanel() {
  const formats = [["Instagram", "1080 × 1080", "1:1"], ["Stories", "1080 × 1920", "9:16"], ["LinkedIn", "1200 × 627", "1.91:1"], ["Landing Page", "1440 px", "Web"], ["Relatórios", "210 × 297 mm", "A4"], ["Newsletter", "600 px", "Email"], ["Apresentações", "1920 × 1080", "16:9"], ["Thumbnail", "1280 × 720", "16:9"]];
  return <div className="brand-format-grid">{formats.map(([name,size,ratio]) => <div key={name}><strong>{name}</strong><span>{size}</span><small>{ratio}</small></div>)}</div>;
}

function ApplicationsPanel() {
  return <div className="brand-application-grid"><div className="app-feed"><img src="/raio-x-logo-branco.svg" alt=""/><span>DIAGNÓSTICO</span><strong>Seu portfólio revela como você pensa?</strong></div><div className="app-story"><img src="/raio-x-logo-branco.svg" alt=""/><strong>Clareza<br/>orienta<br/>escolhas.</strong><span>STORY · 9:16</span></div><div className="app-thumb"><span>AULA</span><strong>O que seu portfólio não está dizendo</strong><small>RAIO X DO DESIGNER</small></div></div>;
}

function ExtraPanel({ id }) {
  if (id === "visual") return <VisualIdentityPanel/>;
  if (id === "typography") return <TypographyPanel/>;
  if (id === "visual-system") return <VisualSystemPanel/>;
  if (id === "applications") return <ApplicationsPanel/>;
  return null;
}

function Loading() { return <div className="min-h-screen bg-[#f7f7f3] grid place-items-center text-[#6c706f] text-sm">Validando acesso…</div>; }

export function BrandCenterPage() {
  const [admin, setAdmin] = useState(null); const [active, setActive] = useState("home"); const [query, setQuery] = useState(""); const [dark, setDark] = useState(false);
  useEffect(() => { if (!getStoredAdminSession()?.accessToken) { window.location.href = "/admin/login?next=/admin/brand"; return; } fetchAdminSession().then(({ admin: nextAdmin }) => setAdmin(nextAdmin)).catch(() => { window.location.href = "/admin/login?next=/admin/brand"; }); }, []);
  const visibleDocuments = useMemo(() => documents.filter((document) => `${document.label} ${document.group} ${document.content}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const current = documents.find((document) => document.id === active) || documents[0];
  async function logout() { await signOutAdmin(); window.location.href = "/admin/login"; }
  if (!admin) return <Loading />;
  return <div className={dark ? "dark" : ""}><div className="min-h-screen bg-[#f7f7f3] text-[#131722] dark:bg-[#0d1119] dark:text-[#edf0ed]">
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#010c1b] p-6 text-white lg:flex"><a href="/admin/dashboard" className="mb-10"><img src="/raio-x-logo-branco.svg" alt="Raio X do Designer" className="h-9 w-auto" /></a><nav className="brand-sidebar-nav">{[...new Set(documents.map(d => d.group))].map(group => <div key={group}><p>{group}</p>{documents.filter(d => d.group === group).map(d => <button key={d.id} onClick={() => setActive(d.id)} className={active === d.id ? "active" : ""}>{d.label}</button>)}</div>)}</nav><div className="mt-auto border-t border-white/10 pt-4 text-[10px] text-[#9ca3af]"><p className="truncate">{admin.email}</p><p className="capitalize">{admin.role}</p></div></aside>
    <div className="lg:pl-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-black/10 bg-white/95 px-5 backdrop-blur-xl dark:border-white/10 dark:bg-[#010c1b]/95 lg:justify-end lg:px-8"><div className="flex items-center gap-2 lg:hidden"><BookOpen className="h-4 w-4"/><select value={active} onChange={e => setActive(e.target.value)} className="max-w-44 bg-transparent text-sm outline-none">{documents.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></div><div className="flex items-center gap-2"><label className="hidden h-9 w-60 items-center gap-2 rounded border border-black/10 px-3 text-[#6c706f] dark:border-white/10 md:flex"><Search className="h-4 w-4"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar" className="min-w-0 flex-1 bg-transparent text-xs outline-none"/></label><button onClick={() => setDark(v => !v)} className="grid h-9 w-9 place-items-center rounded border border-black/10 dark:border-white/10">{dark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}</button><button onClick={logout} className="flex h-9 items-center gap-2 rounded border border-black/10 px-3 text-xs dark:border-white/10"><LogOut className="h-3.5 w-3.5"/>Sair</button></div></header>
      <main className="mx-auto w-full max-w-[1180px] px-4 py-8 lg:px-10 lg:py-12">{query ? <section><p className="text-[10px] uppercase tracking-[.18em] text-[#b88728]">Resultados</p><h1 className="mt-4 text-4xl font-semibold">Busca na documentação</h1><div className="mt-10 divide-y border-y">{visibleDocuments.map(d => <button key={d.id} onClick={() => {setActive(d.id);setQuery("")}} className="block w-full py-5 text-left"><small>{d.group}</small><strong className="block">{d.label}</strong></button>)}</div></section> : <article className={`brand-book-page ${active === "home" ? "brand-cover" : ""}`}><div className="brand-page-meta"><span>RAIO X DO DESIGNER</span><span>VERSÃO 1.0 — 2026</span></div><div className="brand-page-content"><ReactMarkdown>{current.content}</ReactMarkdown><ExtraPanel id={active}/></div><footer className="brand-page-footer"><span>“Enxergue além das ferramentas.”</span><span>{String(documents.findIndex(d => d.id === active)+1).padStart(2,"0")} / {String(documents.length).padStart(2,"0")}</span></footer></article>}</main>
    </div></div></div>;
}
