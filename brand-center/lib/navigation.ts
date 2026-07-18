export type NavItem = { title: string; href: string; description: string };
export type NavGroup = { title: string; items: NavItem[] };

export const navigation: NavGroup[] = [
  { title: "Fundamentos", items: [
    { title: "Visão geral", href: "/admin/brand", description: "O sistema oficial da marca." },
    { title: "Brand Doctrine", href: "/admin/brand/doctrine", description: "As crenças que orientam decisões." },
    { title: "Brand Book", href: "/admin/brand/brand-book", description: "Essência, personalidade e expressão." },
    { title: "Avatar estratégico", href: "/admin/brand/avatar", description: "Para quem a marca existe." },
  ]},
  { title: "Sistemas", items: [
    { title: "Editorial Engine", href: "/admin/brand/editorial", description: "Como a marca pensa e escreve." },
    { title: "Growth Engine", href: "/admin/brand/growth", description: "Como a marca cresce com coerência." },
  ]},
  { title: "Biblioteca", items: [
    { title: "Assets", href: "/admin/brand/assets", description: "Logos, cores, tipos e templates." },
  ]},
];

export const flatNavigation = navigation.flatMap((group) => group.items);
