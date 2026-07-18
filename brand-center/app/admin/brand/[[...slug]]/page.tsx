import { notFound, redirect } from "next/navigation";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import { getDocument } from "@/lib/content";
import { getAdminSession } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function DocumentPage({params}:{params:Promise<{slug?:string[]}>}){const admin=await getAdminSession();if(!admin)redirect("/admin/brand/login");const {slug=[]}=await params;const document=getDocument(slug);if(!document)notFound();const {content}=await compileMDX({source:document.source,components:mdxComponents});return <main className="document"><div className="document-head"><span>{document.meta.section}</span><h1>{document.meta.title}</h1><p>{document.meta.description}</p></div><article className="prose">{content}</article><footer className="document-footer"><span>Documento oficial da marca</span>{document.meta.updatedAt&&<span>Atualizado em {document.meta.updatedAt}</span>}</footer></main>}
