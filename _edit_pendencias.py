path = "app/produtos/page.tsx"
with open(path, "r", encoding="utf-8") as f:
    s = f.read()

old1 = '''  const formValido =
    selecaoCompleta &&
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    termosAceitos &&
    (documentoAdiado || documentoStatus === "validado" || documentoStatus === "incerto");
'''
new1 = '''  const formValido =
    selecaoCompleta &&
    nome.trim().length > 0 &&
    /\\S+@\\S+\\.\\S+/.test(email) &&
    whatsapp.trim().length >= 8 &&
    termosAceitos &&
    (documentoAdiado || documentoStatus === "validado" || documentoStatus === "incerto");

  // Lista do que falta pra liberar o "Finalizar Compra" — pedido do
  // Wilson, 28/set/2026: "precisa exibir uma mensagem avisando o que
  // falta pra poder seguir, mensagens de alerta em amarelo". Só avisa
  // sobre tipo/duração se o resto já foi preenchido (senão duplica o
  // aviso "Selecione o tipo..." que já aparece no lugar do preço).
  const pendenciasFinalizar: string[] = [];
  if (!selecaoCompleta) {
    pendenciasFinalizar.push("Selecione o tipo (Comum ou Green Car) e a duração do passe.");
  }
  if (nome.trim().length === 0) pendenciasFinalizar.push("Preencha seu nome completo.");
  if (!/\\S+@\\S+\\.\\S+/.test(email)) pendenciasFinalizar.push("Preencha um e-mail válido.");
  if (whatsapp.trim().length < 8) pendenciasFinalizar.push("Preencha seu WhatsApp.");
  if (!(documentoAdiado || documentoStatus === "validado" || documentoStatus === "incerto")) {
    pendenciasFinalizar.push('Anexe o documento (passaporte ou passagem) ou escolha "Anexar depois".');
  }
  if (!termosAceitos) {
    pendenciasFinalizar.push(
      termosRolados
        ? "Marque o aceite dos termos e condições do JR Pass."
        : "Role os termos e condições do JR Pass até o fim pra poder aceitá-los.",
    );
  }
'''
assert s.count(old1) == 1
s = s.replace(old1, new1)

old2 = '''              </button>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-black/35">
              Isso não confirma pagamento — nossa equipe confirma a elegibilidade e envia o link de
              pagamento (Pix ou cartão) pelo WhatsApp e por e-mail.
            </p>
          </div>'''
new2 = '''              </button>
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
              Isso não confirma pagamento — nossa equipe confirma a elegibilidade e envia o link de
              pagamento (Pix ou cartão) pelo WhatsApp e por e-mail.
            </p>
          </div>'''
assert s.count(old2) == 1
s = s.replace(old2, new2)

with open(path, "w", encoding="utf-8") as f:
    f.write(s)
print("OK JR Pass pendencias")
