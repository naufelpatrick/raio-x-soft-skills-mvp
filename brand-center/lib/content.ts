import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type DocumentMeta = { title: string; description: string; section: string; order: number; updatedAt?: string; status?: string };

const contentRoot = path.join(process.cwd(), "content");

export function getDocument(slug: string[]) {
  const file = slug.length ? path.join(contentRoot, ...slug) + ".mdx" : path.join(contentRoot, "index.mdx");
  if (!fs.existsSync(file)) return null;
  const parsed = matter(fs.readFileSync(file, "utf8"));
  return { meta: parsed.data as DocumentMeta, source: parsed.content };
}

export function getAllDocuments() {
  const walk = (directory: string): string[] => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : entry.name.endsWith(".mdx") ? [path.join(directory, entry.name)] : []);
  return walk(contentRoot).map((file) => {
    const parsed = matter(fs.readFileSync(file, "utf8"));
    const relative = path.relative(contentRoot, file).replace(/\.mdx$/, "").replace(/index$/, "");
    return { ...(parsed.data as DocumentMeta), href: `/admin/brand${relative ? `/${relative}` : ""}` };
  });
}
