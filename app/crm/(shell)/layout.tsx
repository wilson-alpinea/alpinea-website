import { Bodoni_Moda } from "next/font/google";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../actions";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const NAV = [
  { href: "/crm", label: "Dashboard" },
  { href: "/crm/clientes", label: "Clientes" },
  { href: "/crm/pipeline", label: "Pipeline" },
];

export default async function CrmShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let nomeExibicao = user?.email ?? "";
  if (user?.id) {
    const { data: perfil } = await supabase
      .from("perfis")
      .select("nome")
      .eq("id", user.id)
      .maybeSingle();
    if (perfil?.nome) nomeExibicao = perfil.nome;
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-8">
            <span className={`${display.className} text-lg font-medium text-black`}>
              CRM Alpinea
            </span>
            <nav className="hidden items-center gap-6 text-sm text-black/50 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="transition hover:text-black"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-xs uppercase tracking-[0.2em] text-black/35 sm:inline">
              {nomeExibicao}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-black/15 px-4 py-1.5 text-xs uppercase tracking-[0.15em] text-black/50 transition hover:border-black/40 hover:text-black"
              >
                Sair
              </button>
            </form>
          </div>
        </div>

        <nav className="flex items-center gap-5 overflow-x-auto border-t border-black/5 px-6 py-2.5 text-sm text-black/50 md:hidden">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap transition hover:text-black">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">{children}</main>
    </div>
  );
}
