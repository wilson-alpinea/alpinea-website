def once(c, old, new, label):
    n = c.count(old)
    assert n == 1, f"{label}: expected 1 match, got {n}"
    return c.replace(old, new, 1)

path = "app/components/CustomPackageCard.tsx"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# ---------- 1) Replace EXEMPLOS_HOTEIS (category-only) with:
#   - CIDADES_HOTEL_EXEMPLO (10 city keys, reuse DestinoKey)
#   - INFO_CATEGORIA_HOTEL (category-level info, no more "exemplos")
#   - EXEMPLOS_HOTEIS_POR_CIDADE (5 real hotel names x 4 categorias x 10 cidades)
old_data = '''// Exemplos de propriedades por categoria, para o "Ver detalhes" do item
// Hotel — referência de m² médio, tipo de quarto padrão e comodidades mais
// comuns em cada faixa (pesquisa de mercado, Tokyo, ago/2026). Nomes de
// hotéis são apenas exemplos ilustrativos da categoria, não parceiros
// fixos — a Ajisai seleciona a propriedade conforme roteiro e disponibilidade.
export const EXEMPLOS_HOTEIS: Record<
  (typeof CATEGORIAS_HOTEL)[number],
  {
    m2Medio: string;
    tipoQuarto: string;
    amenidades: { piscina: boolean; academia: boolean; sauna: boolean; restaurante: boolean };
    exemplos: string[];
    // Fotos reais de cada categoria (5 por categoria, no carrossel do
    // popup) — pendente: aguardando material fornecido pela Ajisai pra
    // nao usar fotos de propriedades sem autorizacao. Vazio = placeholder.
    fotos: string[];
  }
> = {
  "3 estrelas": {
    m2Medio: "~23–25 m²",
    tipoQuarto: "Quarto padrão compacto — cama + escrivaninha, banheiro integrado",
    amenidades: { piscina: false, academia: false, sauna: false, restaurante: false },
    exemplos: ["APA Hotel", "Mitsui Garden Hotel", "Richmond Hotel"],
    fotos: [],
  },
  "4 estrelas": {
    m2Medio: "~30 m²",
    tipoQuarto: "Quarto standard/superior — mais espaço de estar, amenidades de mid-range",
    amenidades: { piscina: false, academia: true, sauna: false, restaurante: true },
    exemplos: ["Hotel Gracery", "Shinagawa Prince Hotel", "Hilton Tokyo"],
    fotos: [],
  },
  "5 estrelas": {
    m2Medio: "~36 m²+",
    tipoQuarto: "Quarto de luxo/suíte — enxoval premium, área de estar separada",
    amenidades: { piscina: true, academia: true, sauna: true, restaurante: true },
    exemplos: ["Park Hyatt Tokyo", "Conrad Tokyo", "The Ritz-Carlton Tokyo"],
    fotos: [],
  },
  "Elite": {
    m2Medio: "~70–80 m²+",
    tipoQuarto: "Suíte ultra-luxo — living room, banheira separada, vista panorâmica",
    amenidades: { piscina: true, academia: true, sauna: true, restaurante: true },
    exemplos: ["Aman Tokyo", "Janu Tokyo", "Mandarin Oriental Tokyo"],
    fotos: [],
  },
};'''

new_data = '''// Os 10 principais destinos do Japao pra turismo de alta renda — usados no
// seletor de cidade do popup de Hoteis. Mesmas chaves de DestinoKey (ver
// DESTINOS mais abaixo) pra reaproveitar nome de exibicao e o
// multiplicador de preco por cidade ja calibrado em CIDADE_MULTIPLICADOR_HOTEL,
// sem duplicar dado nenhum.
export const CIDADES_HOTEL_EXEMPLO = [
  "tokyo",
  "kyoto",
  "osaka",
  "nagoya",
  "yokohama",
  "hokkaido",
  "kobe",
  "fukuoka",
  "hiroshima",
  "nara",
] as const;

// Perfil geral de cada categoria de hotel — m² médio, tipo de quarto padrão
// e comodidades mais comuns na faixa (pesquisa de mercado, referência
// Tokyo, ago/2026). Não varia por cidade: o padrão de uma categoria (ex.:
// "5 estrelas") é equivalente em qualquer cidade do Japão — só os exemplos
// de propriedade e o preço médio mudam por cidade (ver
// EXEMPLOS_HOTEIS_POR_CIDADE e DIARIA_HOTEL × CIDADE_MULTIPLICADOR_HOTEL).
export const INFO_CATEGORIA_HOTEL: Record<
  (typeof CATEGORIAS_HOTEL)[number],
  {
    m2Medio: string;
    tipoQuarto: string;
    amenidades: { piscina: boolean; academia: boolean; sauna: boolean; restaurante: boolean };
    // Fotos reais de cada categoria (5 por categoria, no carrossel do
    // popup) — pendente: aguardando material fornecido pela Ajisai pra
    // nao usar fotos de propriedades sem autorizacao. Vazio = placeholder.
    fotos: string[];
  }
> = {
  "3 estrelas": {
    m2Medio: "~23–25 m²",
    tipoQuarto: "Quarto padrão compacto — cama + escrivaninha, banheiro integrado",
    amenidades: { piscina: false, academia: false, sauna: false, restaurante: false },
    fotos: [],
  },
  "4 estrelas": {
    m2Medio: "~30 m²",
    tipoQuarto: "Quarto standard/superior — mais espaço de estar, amenidades de mid-range",
    amenidades: { piscina: false, academia: true, sauna: false, restaurante: true },
    fotos: [],
  },
  "5 estrelas": {
    m2Medio: "~36 m²+",
    tipoQuarto: "Quarto de luxo/suíte — enxoval premium, área de estar separada",
    amenidades: { piscina: true, academia: true, sauna: true, restaurante: true },
    fotos: [],
  },
  "Elite": {
    m2Medio: "~70–80 m²+",
    tipoQuarto: "Suíte ultra-luxo — living room, banheira separada, vista panorâmica",
    amenidades: { piscina: true, academia: true, sauna: true, restaurante: true },
    fotos: [],
  },
};

// Exemplos reais de propriedades por cidade e categoria (pesquisa de
// mercado, set/2026) — nomes de hotéis existentes e em operação, usados só
// como referência ilustrativa da categoria naquela cidade, não parceiros
// fixos: a Ajisai seleciona a propriedade conforme roteiro e
// disponibilidade. Em cidades sem bandeira internacional de ultra-luxo
// (Nara, Hiroshima, Kobe, Sapporo), "Elite" usa a melhor opção real
// disponível na cidade — ryokan histórico, propriedade boutique de
// referência etc. — em vez de inventar uma bandeira que não existe ali.
export const EXEMPLOS_HOTEIS_POR_CIDADE: Record<
  (typeof CIDADES_HOTEL_EXEMPLO)[number],
  Record<(typeof CATEGORIAS_HOTEL)[number], string[]>
> = {
  tokyo: {
    "3 estrelas": [
      "APA Hotel Shinjuku Kabukicho Tower",
      "Toyoko Inn Tokyo Nihombashi Ningyocho",
      "Richmond Hotel Tokyo Suidobashi",
      "Dormy Inn Premium Ginza",
      "Mitsui Garden Hotel Ginza Premier",
    ],
    "4 estrelas": [
      "Hotel Gracery Shinjuku",
      "Shinagawa Prince Hotel",
      "Hilton Tokyo",
      "Sheraton Miyako Hotel Tokyo",
      "Tokyo Marriott Hotel",
    ],
    "5 estrelas": [
      "Park Hyatt Tokyo",
      "Conrad Tokyo",
      "The Ritz-Carlton Tokyo",
      "Four Seasons Hotel Tokyo at Otemachi",
      "Palace Hotel Tokyo",
    ],
    "Elite": ["Aman Tokyo", "Janu Tokyo", "Mandarin Oriental Tokyo", "The Peninsula Tokyo", "Hoshinoya Tokyo"],
  },
  kyoto: {
    "3 estrelas": [
      "APA Hotel Kyoto Ekimae",
      "Toyoko Inn Kyoto Shijo-Karasuma",
      "Richmond Hotel Premier Kyoto Ekimae",
      "Dormy Inn Premium Kyoto Ekimae",
      "Mitsui Garden Hotel Kyoto Shijo",
    ],
    "4 estrelas": [
      "Hotel Granvia Kyoto",
      "Kyoto Tokyu Hotel",
      "Rihga Royal Hotel Kyoto",
      "ANA Crowne Plaza Kyoto",
      "Kyoto Century Hotel",
    ],
    "5 estrelas": [
      "The Ritz-Carlton Kyoto",
      "Park Hyatt Kyoto",
      "Four Seasons Hotel Kyoto",
      "Hotel The Mitsui Kyoto",
      "Suiran, a Luxury Collection Hotel, Kyoto",
    ],
    "Elite": ["Aman Kyoto", "Hoshinoya Kyoto", "Tawaraya", "Roku Kyoto, LXR Hotels & Resorts", "Hiiragiya"],
  },
  osaka: {
    "3 estrelas": [
      "APA Hotel Namba Shinsaibashi",
      "Toyoko Inn Osaka Namba",
      "Richmond Hotel Namba Daikokucho",
      "Dormy Inn Premium Namba",
      "Mitsui Garden Hotel Osaka Premier",
    ],
    "4 estrelas": [
      "Hotel Granvia Osaka",
      "Swissotel Nankai Osaka",
      "Osaka Marriott Miyako Hotel",
      "Sheraton Miyako Hotel Osaka",
      "ANA Crowne Plaza Osaka",
    ],
    "5 estrelas": [
      "InterContinental Osaka",
      "W Osaka",
      "Hotel Hankyu RESPIRE Osaka",
      "Rihga Royal Hotel Osaka",
      "Hotel Nikko Osaka",
    ],
    "Elite": [
      "Four Seasons Hotel Osaka",
      "Waldorf Astoria Osaka",
      "The Ritz-Carlton Osaka",
      "Conrad Osaka",
      "The St. Regis Osaka",
    ],
  },
  nagoya: {
    "3 estrelas": [
      "APA Hotel Nagoya Nishiki Excellent",
      "Toyoko Inn Nagoya Sakae",
      "Dormy Inn Premium Nagoya Sakae",
      "Mitsui Garden Hotel Nagoya Premier",
      "Super Hotel Nagoya Ekimae",
    ],
    "4 estrelas": [
      "Nagoya JR Gate Tower Hotel",
      "ANA Crowne Plaza Hotel Grand Court Nagoya",
      "Meitetsu Grand Hotel",
      "Nagoya Sakae Washington Hotel Plaza",
      "Daiwa Roynet Hotel Nagoya-Fushimi",
    ],
    "5 estrelas": [
      "Nagoya Marriott Associa Hotel",
      "Hilton Nagoya",
      "THE TOWER HOTEL NAGOYA",
      "The Strings Hotel Nagoya",
      "Nagoya Kanko Hotel",
    ],
    "Elite": [
      "Conrad Nagoya",
      "Espacio Nagoya Castle, The Leading Hotels of the World",
      "TIAD, Autograph Collection",
      "Hotel Nagoya Castle (The Westin)",
      "Kikunoya",
    ],
  },
  yokohama: {
    "3 estrelas": [
      "APA Hotel Yokohama Kannai",
      "Toyoko Inn Yokohama Kannai",
      "Richmond Hotel Yokohama Ekimae",
      "Dormy Inn Premium Yokohama",
      "Comfort Hotel Yokohama Kannai",
    ],
    "4 estrelas": [
      "Yokohama Excel Hotel Tokyu",
      "Mitsui Garden Hotel Yokohama Minatomirai Premier",
      "Yokohama Sakuragicho Washington Hotel",
      "THE GATEHOTEL YOKOHAMA by HULIC",
      "Yokohama Tokyu REI Hotel",
    ],
    "5 estrelas": [
      "InterContinental Yokohama Grand",
      "The Westin Yokohama",
      "InterContinental Yokohama Pier 8",
      "Hilton Yokohama",
      "Hyatt Regency Yokohama",
    ],
    "Elite": [
      "The Kahala Hotel & Resort Yokohama",
      "Hotel New Grand",
      "The Yokohama Bay Hotel Tokyu",
      "Yokohama Royal Park Hotel",
      "Yokohama Bay Sheraton Hotel & Towers",
    ],
  },
  hokkaido: {
    "3 estrelas": [
      "APA Hotel Sapporo Susukino Ekimae",
      "Toyoko Inn Hokkaido Sapporo-eki Minami-guchi",
      "Dormy Inn Premium Sapporo",
      "Mitsui Garden Hotel Sapporo West",
      "Richmond Hotel Sapporo Odori",
    ],
    "4 estrelas": [
      "ANA Crowne Plaza Sapporo",
      "Sapporo Tokyu REI Hotel",
      "Mercure Sapporo",
      "Nest Hotel Sapporo Odori",
      "Cross Hotel Sapporo",
    ],
    "5 estrelas": [
      "Keio Plaza Hotel Sapporo",
      "The Gate Hotel Sapporo By Hulic",
      "Hyatt Centric Sapporo",
      "Solaria Nishitetsu Hotel Sapporo",
      "The Royal Park Canvas Sapporo Odori Park",
    ],
    "Elite": [
      "Sapporo Grand Hotel",
      "JR Tower Hotel Nikko Sapporo",
      "InterContinental Sapporo by IHG",
      "The Knot Sapporo",
      "Onsen Ryokan Yuen Sapporo",
    ],
  },
  kobe: {
    "3 estrelas": [
      "APA Hotel Sannomiya",
      "Toyoko Inn Kobe Sannomiya",
      "Dormy Inn Premium Kobe Sannomiya",
      "Mitsui Garden Hotel Kobe",
      "Comfort Hotel Kobe Sannomiya",
    ],
    "4 estrelas": [
      "ANA Crowne Plaza Kobe",
      "Kobe Bay Sheraton Hotel & Towers",
      "Kobe Portopia Hotel",
      "Hotel Piena Kobe",
      "Arima Onsen Taketoritei Maruyama",
    ],
    "5 estrelas": [
      "Hotel Okura Kobe",
      "Hotel La Suite Kobe Harborland",
      "Kobe Marriott Hotel",
      "Kobe Meriken Park Oriental Hotel",
      "Arima Grand Hotel",
    ],
    "Elite": [
      "Kobe Kitano Hotel",
      "Nakanobo Zuien",
      "Arima Onsen Tosen Goshobo",
      "Miyukiso Hanamusubi",
      "Arima Onsen Gekkoen Yugetsusanso",
    ],
  },
  fukuoka: {
    "3 estrelas": [
      "APA Hotel Hakata Ekimae 3chome",
      "Toyoko Inn Hakata-guchi Ekimae Gion",
      "Dormy Inn Hakata Gion",
      "Mitsui Garden Hotel Fukuoka Gion",
      "Canal City Fukuoka Washington Hotel",
    ],
    "4 estrelas": [
      "Solaria Nishitetsu Hotel Fukuoka",
      "The Royal Park Canvas Fukuoka Nakasu",
      "Nishitetsu Grand Hotel",
      "Oriental Hotel Fukuoka Hakata Station",
      "ANA Crowne Plaza Fukuoka",
    ],
    "5 estrelas": [
      "Hotel Nikko Fukuoka",
      "Hotel Okura Fukuoka",
      "Hilton Fukuoka Sea Hawk",
      "Grand Hyatt Fukuoka",
      "THE358 Sora",
    ],
    "Elite": [
      "The Ritz-Carlton, Fukuoka",
      "THE LUIGANS Spa & Resort",
      "With The Style Fukuoka",
      "seven x seven Itoshima",
      "Hotel Il Palazzo",
    ],
  },
  hiroshima: {
    "3 estrelas": [
      "APA Hotel Hiroshima Ekimae Ohashi",
      "Toyoko Inn Hiroshima Ekimae Ohashi",
      "Dormy Inn Hiroshima Kokutaijimachi",
      "Hotel Flex Hiroshima",
      "Super Hotel Hiroshima",
    ],
    "4 estrelas": [
      "Mitsui Garden Hotel Hiroshima",
      "Hiroshima Tokyu REI Hotel",
      "Sotetsu Grand Fresa Hiroshima",
      "Daiwa Roynet Hotel Hiroshima",
      "Hotel Active Hiroshima",
    ],
    "5 estrelas": [
      "Sheraton Grand Hiroshima Hotel",
      "RIHGA Royal Hotel Hiroshima",
      "Hotel Granvia Hiroshima",
      "ANA Crowne Plaza Hiroshima",
      "Hotel Granvia Hiroshima South Gate",
    ],
    "Elite": [
      "Grand Prince Hotel Hiroshima",
      "KIRO Hiroshima by THE SHARE HOTELS",
      "THE KNOT HIROSHIMA",
      "Grand Base Hiroshima Peace Memorial Park",
      "River Suites Hiroshima",
    ],
  },
  nara: {
    "3 estrelas": [
      "APA Hotel Kintetsu Nara Ekimae",
      "Toyoko Inn Nara Shin-Omiya Ekimae",
      "Toyoko Inn Kintetsu Nara Ekimae",
      "Onyado Nono Nara (Dormy Inn)",
      "Super Hotel Premier JR Nara Station",
    ],
    "4 estrelas": [
      "Nara Washington Hotel Plaza",
      "Hotel Fujita Nara",
      "Hotel Sunroute Nara",
      "Comfort Hotel Nara",
      "Henn na Hotel Nara",
    ],
    "5 estrelas": [
      "JW Marriott Hotel Nara",
      "Nara Royal Hotel",
      "Hotel Nikko Nara",
      "Kotonoyado Musashino",
      "Shikitei",
    ],
    "Elite": ["Shisui, a Luxury Collection Hotel, Nara", "FUFU Nara", "The Nara Hotel", "Edosan", "Tsukihitei"],
  },
};'''

c = once(c, old_data, new_data, "EXEMPLOS_HOTEIS -> CIDADES/INFO_CATEGORIA/EXEMPLOS_POR_CIDADE")

# ---------- 2) HotelExemplosPropriedades: add cidade selector + preco medio ----------
old_component = '''export function HotelExemplosPropriedades({
  categoriaAtiva,
  light = false,
}: {
  categoriaAtiva?: (typeof CATEGORIAS_HOTEL)[number];
  light?: boolean;
}) {
  const t = light
    ? {
        text: "text-black",
        label: "text-black/40",
        sub: "text-black/55",
        info: "text-black/70",
        infoLabel: "text-black/40",
        border: "border-black/10",
        bg: "bg-black/[0.02]",
        offBorder: "border-black/10",
        offText: "text-black/30",
      }
    : {
        text: "text-white",
        label: "text-white/40",
        sub: "text-white/55",
        info: "text-white/70",
        infoLabel: "text-white/40",
        border: "border-white/10",
        bg: "bg-white/[0.02]",
        offBorder: "border-white/10",
        offText: "text-white/30",
      };

  return (
    <div>
      <p className={`text-[11px] uppercase tracking-[0.2em] ${t.label}`}>Exemplos de Propriedades</p>
      <div className="mt-3 space-y-4">
        {CATEGORIAS_HOTEL.map((cat) => {
          const info = EXEMPLOS_HOTEIS[cat];
          const ativo = cat === categoriaAtiva;
          const amenidadeLabel: [keyof typeof info.amenidades, string][] = [
            ["piscina", "Piscina"],
            ["academia", "Academia"],
            ["sauna", "Sauna"],
            ["restaurante", "Restaurante"],
          ];
          return (
            <div
              key={cat}
              className={`rounded-2xl border p-4 md:p-5 ${
                ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.06]" : `${t.border} ${t.bg}`
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="md:w-[240px] md:shrink-0">
                  <p className={`text-base font-semibold uppercase tracking-[0.08em] ${t.text}`}>
                    {cat}
                    {ativo && (
                      <span className="ml-2 rounded-full bg-[#2f80c9]/20 px-2 py-0.5 text-[9px] font-medium normal-case tracking-normal text-[#6ec3d9]">
                        selecionado
                      </span>
                    )}
                  </p>
                  <p className={`mt-1.5 text-xs ${t.sub}`}>{info.exemplos.join(" · ")}</p>
                  <p className={`mt-3 text-xs ${t.info}`}>
                    <span className={t.infoLabel}>m² médio:</span> {info.m2Medio}
                  </p>
                  <p className={`mt-1 text-xs ${t.info}`}>
                    <span className={t.infoLabel}>Quarto:</span> {info.tipoQuarto}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {amenidadeLabel.map(([key, label]) => (
                      <span
                        key={key}
                        className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.05em] ${
                          info.amenidades[key]
                            ? "border-[#6ec3d9]/40 bg-[#6ec3d9]/[0.08] text-[#6ec3d9]"
                            : `${t.offBorder} ${t.offText} line-through`
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <FotoCarousel fotos={info.fotos} categoria={cat} light={light} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}'''

new_component = '''export function HotelExemplosPropriedades({
  categoriaAtiva,
  light = false,
}: {
  categoriaAtiva?: (typeof CATEGORIAS_HOTEL)[number];
  light?: boolean;
}) {
  const [cidade, setCidade] = useState<(typeof CIDADES_HOTEL_EXEMPLO)[number]>("tokyo");

  const t = light
    ? {
        text: "text-black",
        label: "text-black/40",
        sub: "text-black/55",
        info: "text-black/70",
        infoLabel: "text-black/40",
        border: "border-black/10",
        bg: "bg-black/[0.02]",
        offBorder: "border-black/10",
        offText: "text-black/30",
        selectBorder: "border-black/15",
        selectBg: "bg-black/[0.03]",
      }
    : {
        text: "text-white",
        label: "text-white/40",
        sub: "text-white/55",
        info: "text-white/70",
        infoLabel: "text-white/40",
        border: "border-white/10",
        bg: "bg-white/[0.02]",
        offBorder: "border-white/10",
        offText: "text-white/30",
        selectBorder: "border-white/15",
        selectBg: "bg-white/[0.05]",
      };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className={`text-[11px] uppercase tracking-[0.2em] ${t.label}`}>Exemplos de Propriedades</p>
        <label className="flex flex-col gap-1.5">
          <span className={`text-[10px] uppercase tracking-[0.15em] ${t.label}`}>Cidade</span>
          <select
            value={cidade}
            onChange={(e) => setCidade(e.target.value as (typeof CIDADES_HOTEL_EXEMPLO)[number])}
            className={`h-9 min-w-[170px] rounded-lg border px-3 text-xs outline-none focus:border-[#6ec3d9] ${t.selectBorder} ${t.selectBg} ${t.text}`}
          >
            {CIDADES_HOTEL_EXEMPLO.map((key) => (
              <option key={key} value={key}>
                {DESTINOS.find((d) => d.key === key)?.nome ?? key}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-3 space-y-4">
        {CATEGORIAS_HOTEL.map((cat) => {
          const info = INFO_CATEGORIA_HOTEL[cat];
          const exemplos = EXEMPLOS_HOTEIS_POR_CIDADE[cidade][cat];
          const precoMedio = Math.round(DIARIA_HOTEL[cat] * CIDADE_MULTIPLICADOR_HOTEL[cidade]);
          const ativo = cat === categoriaAtiva;
          const amenidadeLabel: [keyof typeof info.amenidades, string][] = [
            ["piscina", "Piscina"],
            ["academia", "Academia"],
            ["sauna", "Sauna"],
            ["restaurante", "Restaurante"],
          ];
          return (
            <div
              key={cat}
              className={`rounded-2xl border p-4 md:p-5 ${
                ativo ? "border-[#2f80c9] bg-[#2f80c9]/[0.06]" : `${t.border} ${t.bg}`
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start">
                <div className="md:w-[240px] md:shrink-0">
                  <p className={`text-base font-semibold uppercase tracking-[0.08em] ${t.text}`}>
                    {cat}
                    {ativo && (
                      <span className="ml-2 rounded-full bg-[#2f80c9]/20 px-2 py-0.5 text-[9px] font-medium normal-case tracking-normal text-[#6ec3d9]">
                        selecionado
                      </span>
                    )}
                  </p>
                  <p className={`mt-1.5 text-xs ${t.sub}`}>{exemplos.join(" · ")}</p>
                  <p className={`mt-3 text-xs ${t.info}`}>
                    <span className={t.infoLabel}>Preço médio:</span> {formatBRL(precoMedio)} / noite
                  </p>
                  <p className={`mt-1 text-xs ${t.info}`}>
                    <span className={t.infoLabel}>m² médio:</span> {info.m2Medio}
                  </p>
                  <p className={`mt-1 text-xs ${t.info}`}>
                    <span className={t.infoLabel}>Quarto:</span> {info.tipoQuarto}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {amenidadeLabel.map(([key, label]) => (
                      <span
                        key={key}
                        className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-[0.05em] ${
                          info.amenidades[key]
                            ? "border-[#6ec3d9]/40 bg-[#6ec3d9]/[0.08] text-[#6ec3d9]"
                            : `${t.offBorder} ${t.offText} line-through`
                        }`}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <FotoCarousel fotos={info.fotos} categoria={cat} light={light} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}'''

c = once(c, old_component, new_component, "HotelExemplosPropriedades cidade selector + preco medio")

with open(path, "w", encoding="utf-8") as f:
    f.write(c)

print("DONE")
