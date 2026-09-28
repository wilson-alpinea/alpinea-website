path = "app/produtos/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

# ---------- Transporte Privado (TransporteModal) ----------
old1 = '''  const formValido =
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    quantidadeItens > 0 &&
    termosAceitos;

  async function enviar() {'''
new1 = '''  const formValido =
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    quantidadeItens > 0 &&
    termosAceitos;

  // Lista do que falta pra liberar o botão — pedido do Wilson,
  // 28/set/2026: "precisa exibir uma mensagem avisando o que falta pra
  // poder seguir, mensagens de alerta em amarelo" (mesmo padrão do JR
  // Pass, aplicado aqui também).
  const pendenciasFinalizar: string[] = [];
  if (quantidadeItens === 0) pendenciasFinalizar.push("Selecione ao menos uma rota ou tour.");
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\\S+@\\S+\\.\\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");
  if (!termosAceitos) {
    pendenciasFinalizar.push(
      termosRolados
        ? "Marque o aceite dos termos e condições do transporte privado."
        : "Role os termos e condições do transporte privado até o fim pra poder aceitá-los.",
    );
  }

  async function enviar() {'''
assert s.count(old1) == 1
s = s.replace(old1, new1)

old1b = '''                {status === "enviando" ? "Enviando…" : "Solicitar Transporte Privado"}
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — sua equipe Ajisai entra em contato pelo WhatsApp pra
              fechar a logística do seu transporte privado.'''
new1b = '''                {status === "enviando" ? "Enviando…" : "Solicitar Transporte Privado"}
              </button>
            </div>
            {pendenciasFinalizar.length > 0 && status !== "enviando" && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-5 text-amber-800">
                <p className="font-medium">Falta o seguinte pra finalizar:</p>
                <ul className="mt-1 list-disc pl-4">
                  {pendenciasFinalizar.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — sua equipe Ajisai entra em contato pelo WhatsApp pra
              fechar a logística do seu transporte privado.'''
assert s.count(old1b) == 1
s = s.replace(old1b, new1b)

# ---------- Seguro Viagem (SeguroViagemModal) ----------
old2 = '''  const formValido =
    !!seguradora &&
    !residenciaBloqueada &&
    (moraEm === "brasil" || moraEm === "japao") &&
    !!paisDestino &&
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    !!dataInicio &&
    !!dataFim &&
    dias > 0 &&
    idadesNumericas.length === numViajantes;

  async function enviar() {'''
new2 = '''  const formValido =
    !!seguradora &&
    !residenciaBloqueada &&
    (moraEm === "brasil" || moraEm === "japao") &&
    !!paisDestino &&
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    !!dataInicio &&
    !!dataFim &&
    dias > 0 &&
    idadesNumericas.length === numViajantes;

  // Lista do que falta pra liberar o botão — pedido do Wilson,
  // 28/set/2026: "precisa exibir uma mensagem avisando o que falta pra
  // poder seguir, mensagens de alerta em amarelo" (mesmo padrão do JR
  // Pass, aplicado aqui também).
  const pendenciasFinalizar: string[] = [];
  if (moraEm === null) pendenciasFinalizar.push("Informe onde você mora.");
  else if (residenciaBloqueada) {
    pendenciasFinalizar.push("Sua situação de residência não é elegível pra esse seguro — veja o aviso acima.");
  }
  if (!seguradora) pendenciasFinalizar.push("Escolha a seguradora.");
  if (!paisDestino) pendenciasFinalizar.push("Escolha o país de destino.");
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\\S+@\\S+\\.\\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");
  if (!dataInicio) pendenciasFinalizar.push("Preencha a data de início da viagem.");
  if (!dataFim) pendenciasFinalizar.push("Preencha a data de término da viagem.");
  if (dataInicio && dataFim && dias <= 0) {
    pendenciasFinalizar.push("A data de término precisa ser depois da data de início.");
  }
  if (idadesNumericas.length !== numViajantes) pendenciasFinalizar.push("Preencha a idade de todos os viajantes.");

  async function enviar() {'''
assert s.count(old2) == 1
s = s.replace(old2, new2)

old2b = '''                {status === "enviando" ? "Enviando…" : "Solicitar Seguro Viagem"}
              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — sua equipe Ajisai entra em contato pelo WhatsApp pra fechar o'''
new2b = '''                {status === "enviando" ? "Enviando…" : "Solicitar Seguro Viagem"}
              </button>
            </div>
            {pendenciasFinalizar.length > 0 && status !== "enviando" && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-5 text-amber-800">
                <p className="font-medium">Falta o seguinte pra finalizar:</p>
                <ul className="mt-1 list-disc pl-4">
                  {pendenciasFinalizar.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — sua equipe Ajisai entra em contato pelo WhatsApp pra fechar o'''
assert s.count(old2b) == 1
s = s.replace(old2b, new2b)

# ---------- Câmbio (CambioModal) ----------
old3 = '''  const formValido =
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    quantidadeIenes >= CAMBIO_IENES_MINIMO_PUBLICO &&
    totalBRL !== null;

  async function enviar() {'''
new3 = '''  const formValido =
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    quantidadeIenes >= CAMBIO_IENES_MINIMO_PUBLICO &&
    totalBRL !== null;

  // Lista do que falta pra liberar o botão — pedido do Wilson,
  // 28/set/2026: "precisa exibir uma mensagem avisando o que falta pra
  // poder seguir, mensagens de alerta em amarelo" (mesmo padrão do JR
  // Pass, aplicado aqui também).
  const pendenciasFinalizar: string[] = [];
  if (totalBRL === null) pendenciasFinalizar.push("Aguarde a cotação de câmbio carregar.");
  if (quantidadeIenes < CAMBIO_IENES_MINIMO_PUBLICO) {
    pendenciasFinalizar.push(`A quantidade mínima é ¥${CAMBIO_IENES_MINIMO_PUBLICO.toLocaleString("pt-BR")}.`);
  }
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\\S+@\\S+\\.\\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");

  async function enviar() {'''
assert s.count(old3) == 1
s = s.replace(old3, new3)

old3b = '''                {status === "enviando"
                  ? "Enviando…"
                  : direcao === "compra"
                    ? "Solicitar Compra de Ienes"
                    : "Solicitar Venda de Ienes"}
              </button>
            </div>'''
new3b = '''                {status === "enviando"
                  ? "Enviando…"
                  : direcao === "compra"
                    ? "Solicitar Compra de Ienes"
                    : "Solicitar Venda de Ienes"}
              </button>
            </div>
            {pendenciasFinalizar.length > 0 && status !== "enviando" && (
              <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-[11px] leading-5 text-amber-800">
                <p className="font-medium">Falta o seguinte pra finalizar:</p>
                <ul className="mt-1 list-disc pl-4">
                  {pendenciasFinalizar.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}'''
assert s.count(old3b) == 1
s = s.replace(old3b, new3b)

with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("OK Transporte + Seguro Viagem + Cambio pendencias")
