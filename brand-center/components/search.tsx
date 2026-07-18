"use client";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
type Item = { title: string; description: string; href: string; section: string };
export function BrandSearch({ items }: { items: Item[] }) {
  const [open,setOpen]=useState(false); const [query,setQuery]=useState("");
  useEffect(()=>{ const handler=(event:KeyboardEvent)=>{ if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==="k"){event.preventDefault();setOpen(true)} if(event.key==="Escape")setOpen(false) }; window.addEventListener("keydown",handler); return()=>window.removeEventListener("keydown",handler)},[]);
  const results=items.filter((item)=>`${item.title} ${item.description} ${item.section}`.toLowerCase().includes(query.toLowerCase()));
  return <><button className="search-trigger" onClick={()=>setOpen(true)}><Search size={15}/><span>Buscar</span><kbd>⌘K</kbd></button>{open&&<div className="search-overlay" role="dialog" aria-modal="true"><div className="search-panel"><div className="search-field"><Search size={18}/><input autoFocus value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Buscar na documentação…"/><button onClick={()=>setOpen(false)}><X size={18}/></button></div><div className="search-results">{results.map((item)=><a key={item.href} href={item.href} onClick={()=>setOpen(false)}><small>{item.section}</small><strong>{item.title}</strong><span>{item.description}</span></a>)}</div></div></div>}</>;
}
