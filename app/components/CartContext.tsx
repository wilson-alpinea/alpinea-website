"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "ajisai-pacotes-cart";

export type CartItem = {
  /** Identificador único da linha no carrinho (não do produto — o mesmo pacote pode entrar 2x com variantes diferentes). */
  id: string;
  /** Divisão de origem, exibida no carrinho. */
  divisao: "Pacotes de Caravana" | "Individual ou Pequenos Grupos" | "Viagem Personalizada";
  /** Nome do pacote (ex: "Primavera 1 — Temporada de Cerejeiras 2027"). */
  nome: string;
  /** Linha secundária com a variante escolhida (ex: "7 dias" ou "12h, 20/04/2027"). */
  variante: string;
  /** Duração isolada (ex: "15 dias"), usada no card enriquecido e no resumo. */
  duracao?: string;
  /** Período/datas isolado (ex: "Datas flexíveis · Mar–Abr 2027"). */
  periodo?: string;
  /** Quantidade de viajantes (ex: "1 adulto"). */
  viajantes?: string;
  /** Tipo de acomodação (ex: "Quarto individual"). */
  acomodacao?: string;
  /** Itens inclusos, com ícone, exibidos como lista no card do carrinho. */
  itens?: { icone: string; texto: string }[];
  /** Detalhes extra em linhas soltas, mostrados no carrinho e na mensagem do WhatsApp. */
  detalhes?: string[];
  /** Preço de referência para exibição (pode ser "Sob consulta"). */
  precoLabel: string;
  /** Complemento do preço (ex: "por pessoa"). */
  precoSufixo?: string;
  imagem?: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Carrega o carrinho salvo assim que o componente monta no navegador.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // localStorage indisponível (modo privado, etc.) — segue com carrinho vazio.
    }
    setHydrated(true);
  }, []);

  // Persiste a cada alteração, depois da hidratação inicial.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // idem
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem: (item) =>
        setItems((prev) => [
          ...prev,
          { ...item, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
        ]),
      removeItem: (id) => setItems((prev) => prev.filter((i) => i.id !== id)),
      clear: () => setItems([]),
      count: items.length,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de <CartProvider>");
  return ctx;
}
