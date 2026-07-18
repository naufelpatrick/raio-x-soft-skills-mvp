import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
export const metadata: Metadata = { title: { default: "Brand Center — Raio X do Designer", template: "%s — Brand Center" }, robots: { index: false, follow: false } };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="pt-BR" suppressHydrationWarning><body><ThemeProvider>{children}</ThemeProvider></body></html> }
