import type { MDXComponents } from "mdx/types";
export function Principle({ number, title, children }: { number: string; title: string; children: React.ReactNode }) { return <section className="principle"><span>{number}</span><div><h3>{title}</h3>{children}</div></section> }
export function DoDont({ doText, dontText }: { doText: string; dontText: string }) { return <div className="do-dont"><div><small>Faça</small><p>{doText}</p></div><div><small>Evite</small><p>{dontText}</p></div></div> }
export function ColorSwatch({ name, value, role }: { name: string; value: string; role: string }) { return <div className="swatch"><div style={{background:value}}/><strong>{name}</strong><code>{value}</code><span>{role}</span></div> }
export const mdxComponents: MDXComponents = { Principle, DoDont, ColorSwatch };
