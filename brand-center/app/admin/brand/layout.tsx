import { BrandShell } from "@/components/brand-shell";
import { getAdminSession } from "@/lib/auth";
import { getAllDocuments } from "@/lib/content";
export default async function BrandLayout({children}:{children:React.ReactNode}) { const admin=await getAdminSession(); if(!admin) return children; return <BrandShell admin={admin} documents={getAllDocuments()}>{children}</BrandShell> }
