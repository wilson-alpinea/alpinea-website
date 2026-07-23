import { Bodoni_Moda } from "next/font/google";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";

const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const COOKIE_NAME = "db_access";
const COOKIE_VALUE = "granted";

// Protege TODAS as páginas dentro de /database (banco de conteúdo interno)
// com uma senha única, guardada em process.env.DATABASE_ACCESS_PASSWORD
// (defina essa variável no .env.local do projeto e no provedor de hosting).
// Ao acertar a senha, um cookie httpOnly é gravado e libera o acesso por
// 30 dias — sem precisar logar de novo a cada visita.
async function login(formData: FormData) {
  "use server";

  const password = formData.get("password");
  const correct = process.env.DATABASE_ACCESS_PASSWORD;

  if (correct && password === correct) {
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/database",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });
    redirect("/database");
  }

  redirect("/database?erro=1");
}

// Gate temporariamente desativado: só ativa a senha quando
// DATABASE_ACCESS_PASSWORD estiver configurada no .env.local (e no
// provedor de hosting). Sem isso, ninguém consegue entrar — inclusive
// você — então o acesso fica liberado normalmente até a senha ser criada.
export default async function DatabaseLayout({ children }: { children: React.ReactNode }) {
  const passwordConfigured = Boolean(process.env.DATABASE_ACCESS_PASSWORD);

  if (!passwordConfigured) {
    return <>{children}</>;
  }

  const cookieStore = await cookies();
  const authorized = cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE;

  if (!authorized) {
    return <LoginForm action={login} displayClassName={display.className} />;
  }

  return <>{children}</>;
}
