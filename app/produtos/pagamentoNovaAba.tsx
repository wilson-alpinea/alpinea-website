"use client";

// Pagamento da Stone em NOVA ABA — pedido do Wilson, 01/out/2026: a página
// de Pix da Stone não tem botão de voltar para o site. Abrindo o pagamento
// em outra aba, a aba do site continua aberta (com a tela "Pedido
// registrado") e o cliente volta para ela quando terminar.
//
// A aba é aberta no clique (antes do fetch), senão o bloqueador de pop-up
// do navegador barra. Se o navegador bloquear mesmo assim, cai no
// comportamento antigo: a página atual vai para a Stone.

export function abrirAbaPagamento(): Window | null {
  try {
    const janela = window.open("about:blank", "_blank");
    if (janela) {
      janela.document.title = "Abrindo pagamento…";
      janela.document.body.innerHTML =
        '<p style="font-family:system-ui,sans-serif;padding:32px;color:#0A2540">Abrindo o pagamento seguro da Stone…</p>';
    }
    return janela;
  } catch {
    return null;
  }
}

/** true = abriu na nova aba (a página atual continua no site). */
export function enviarParaPagamento(janela: Window | null, url: string): boolean {
  if (janela && !janela.closed) {
    try {
      janela.opener = null;
      janela.location.href = url;
      return true;
    } catch {
      /* cai no redirecionamento abaixo */
    }
  }
  window.location.assign(url);
  return false;
}

export function fecharAba(janela: Window | null) {
  try {
    janela?.close();
  } catch {
    /* nada */
  }
}

export function BlocoPagamentoNovaAba({ url }: { url: string }) {
  return (
    <div className="mx-auto mt-4 max-w-md rounded-2xl border border-[#2f80c9]/30 bg-[#eef6fb] px-5 py-4 text-left">
      <p className="text-sm font-semibold text-[#0A2540]">O pagamento abriu em uma nova aba</p>
      <p className="mt-1 text-sm leading-relaxed text-black/70">
        Conclua o Pix ou o cartão na página da Stone. Depois é só fechar aquela aba — você continua aqui no site, e a
        confirmação chega por e-mail.
      </p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#1f6fb8] underline decoration-[#1f6fb8]/30 underline-offset-2"
      >
        A aba não abriu? Abrir o pagamento →
      </a>
    </div>
  );
}
