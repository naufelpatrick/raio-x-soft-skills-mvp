import Link from "next/link";
import { navigation } from "@/lib/navigation";
import { ThemeToggle } from "./theme-toggle";
import { BrandSearch } from "./search";
export function BrandShell({ children, documents, admin }: { children: React.ReactNode; documents: any[]; admin: {email:string;role:string} }) { return <div className="brand-shell"><aside className="sidebar"><Link href="/admin/brand" className="brand-mark"><span>RX</span><strong>RAIO X<br/>DO DESIGNER</strong></Link><nav>{navigation.map((group)=><div key={group.title}><p>{group.title}</p>{group.items.map((item)=><Link key={item.href} href={item.href}>{item.title}</Link>)}</div>)}</nav><footer><span>{admin.email}</span><small>{admin.role}</small></footer></aside><div className="brand-main"><header><BrandSearch items={documents}/><ThemeToggle/></header>{children}</div></div> }
