import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  COOKIE_INDICACAO,
  HOST_AGENCIA,
  HOST_EMPREGOS,
  SLUG_PARCEIRO,
  inicioDoPapel,
  isPapelCrm,
  rotaPermitida,
  unidadeDaRota,
  unidadeDoHost,
  type PapelCrm,
} from "./lib/crm/unidades";
import { COOKIE_UTM, PARAMS_CAMPANHA, type DadosCampanha } from "./lib/crm/canal";

// (No Next.js 16, "middleware.ts" foi renomeado para "proxy.ts".)
//
// 1. Site público: guarda o link de indicação de parceiro (?parceiro=slug)
//    num cookie de 30 dias — os formulários self-service usam para marcar
//    o lead com o parceiro (Wilson, 21/out/2026).
// 2. Domínios dos CRMs: crm.alpinea.io = agência, empregos.alpinea.io =
//    empregos. Cada domínio só abre as telas da sua unidade.
// 3. /crm/*: exige sessão e respeita o papel — parceiro da agência só abre
//    /crm/parceiro, empreiteira só /crm/empreiteira, admin abre tudo.
export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const host = request.headers.get("host");
  const unidadeHost = unidadeDoHost(host);
  const ehCrm = pathname === "/crm" || pathname.startsWith("/crm/");

  if (!ehCrm) {
    // Domínio de CRM fora de /crm → início da unidade.
    if (unidadeHost) {
      const url = request.nextUrl.clone();
      url.pathname = unidadeHost === "empregos" ? "/crm/empregos" : "/crm";
      url.search = "";
      return NextResponse.redirect(url);
    }
    const slug = (searchParams.get("parceiro") || "").trim().toLowerCase();
    const response = NextResponse.next();
    const cookieSeguro = request.nextUrl.protocol === "https:";

    // Origem do lead (Wilson, 21/out/2026): guarda utm_*/gclid/fbclid da
    // última campanha, ou o site de onde a pessoa veio na primeira visita.
    const campanha: DadosCampanha = {};
    for (const k of PARAMS_CAMPANHA) {
      const v = searchParams.get(k);
      if (v) campanha[k] = v.slice(0, 200);
    }
    let refererHost = "";
    try {
      const ref = request.headers.get("referer");
      if (ref) refererHost = new URL(ref).hostname.toLowerCase();
    } catch {}
    const refererExterno = refererHost && refererHost !== (host || "").split(":")[0].toLowerCase() && !refererHost.endsWith("alpinea.io") ? refererHost : "";
    const temCampanha = Object.keys(campanha).length > 0;
    if (temCampanha || (refererExterno && !request.cookies.get(COOKIE_UTM))) {
      const dados: DadosCampanha = { ...campanha, landing: pathname.slice(0, 200), em: new Date().toISOString() };
      if (refererExterno) dados.referer = refererExterno;
      response.cookies.set(COOKIE_UTM, encodeURIComponent(JSON.stringify(dados)), {
        path: "/",
        maxAge: 60 * 60 * 24 * 90,
        sameSite: "lax",
        secure: cookieSeguro,
        httpOnly: true,
      });
    }
    if (slug && SLUG_PARCEIRO.test(slug)) {
      response.cookies.set(COOKIE_INDICACAO, slug, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: cookieSeguro,
        httpOnly: true,
      });
    }
    return response;
  }

  const cookiesParaGravar: { name: string; value: string; options: Record<string, unknown> }[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            cookiesParaGravar.push({ name, value, options: options as Record<string, unknown> });
          });
        },
      },
    },
  );

  const comCookies = (response: NextResponse) => {
    cookiesParaGravar.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    return response;
  };
  const redirecionar = (pathnameDestino: string, hostDestino?: string) => {
    const url = request.nextUrl.clone();
    url.pathname = pathnameDestino;
    if (hostDestino) {
      url.host = hostDestino;
      url.port = "";
      url.protocol = "https:";
    } else {
      url.search = "";
    }
    return comCookies(NextResponse.redirect(url));
  };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Recuperação de senha (Wilson, 23/out/2026): abertas com ou sem sessão e
  // para qualquer papel — quem chega pelo link do e-mail ainda não tem sessão
  // ou acabou de ganhar uma só para trocar a senha.
  if (pathname === "/crm/esqueci-senha" || pathname === "/crm/redefinir-senha") return comCookies(NextResponse.next({ request }));

  const isLoginRoute = pathname === "/crm/login";
  if (!user) {
    return isLoginRoute ? comCookies(NextResponse.next({ request })) : redirecionar("/crm/login");
  }

  // Papel do usuário (perfis.papel — migração 021). Sem papel = sem acesso.
  const { data: perfil } = await supabase.from("perfis").select("papel").eq("id", user.id).maybeSingle();
  const papel: PapelCrm | null = isPapelCrm(perfil?.papel) ? perfil!.papel : null;

  if (isLoginRoute) return redirecionar(inicioDoPapel(papel, unidadeHost));

  if (!rotaPermitida(papel, pathname)) return redirecionar(inicioDoPapel(papel, unidadeHost));

  // Em cada domínio de CRM, /crm abre o início daquela unidade.
  if (unidadeHost && papel === "admin" && (pathname === "/crm" || pathname === "/crm/") && unidadeHost !== "agencia") {
    return redirecionar(inicioDoPapel(papel, unidadeHost));
  }

  // alpinea.io/crm (domínio principal): admin escolhe entre o CRM da
  // agência e o de empregos (Wilson, 21/out/2026).
  if (!unidadeHost && papel === "admin" && (pathname === "/crm" || pathname === "/crm/") && !searchParams.has("ficar")) {
    return redirecionar("/crm/unidades");
  }

  // Cada domínio só mostra a própria unidade; rota da outra unidade vai
  // para o domínio certo.
  const unidadeRota = unidadeDaRota(pathname);
  if (unidadeHost && unidadeRota !== "compartilhada" && unidadeRota !== unidadeHost) {
    // Navegação interna do Next (RSC/server action) não segue redirect para
    // outro domínio — a página quebra ("This page couldn't load"). Nesses
    // casos fica no início da própria unidade.
    const navegacaoInterna = request.headers.has("rsc") || request.headers.has("next-action") || request.headers.has("next-router-prefetch");
    if (navegacaoInterna) return redirecionar(inicioDoPapel(papel, unidadeHost));
    return redirecionar(pathname, unidadeRota === "empregos" ? HOST_EMPREGOS : HOST_AGENCIA);
  }

  // Unidade atual vai num header para o layout montar o menu certo.
  const headers = new Headers(request.headers);
  headers.set("x-crm-unidade", unidadeRota === "compartilhada" ? (unidadeHost ?? "agencia") : unidadeRota);
  return comCookies(NextResponse.next({ request: { headers } }));
}

export const config = {
  // Tudo, menos arquivos estáticos, _next e APIs.
  matcher: ["/((?!_next/|api/|.*\\.[A-Za-z0-9]+$).*)"],
};
