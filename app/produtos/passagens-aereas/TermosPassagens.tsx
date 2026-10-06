// Termos e Condições — Passagem Aérea Internacional (Ajisai), edição
// v1.00 FEV/26. Transcrito do PDF enviado pelo Wilson em 06/out/2026
// ("Termos e Condições - Passagem Aérea Internacional"); o PDF original
// fica em /public/docs/ajisai-termos-passagem-aerea-internacional.pdf.
// Só foram corrigidos erros de digitação evidentes. Ao trocar este texto
// de forma relevante, atualizar TERMOS_VERSAO_PASSAGENS.

import type { ReactNode } from "react";

export const TERMOS_VERSAO_PASSAGENS = "Passagem aérea internacional — edição v1.00 FEV/26";
export const TERMOS_PDF_PASSAGENS = "/docs/ajisai-termos-passagem-aerea-internacional.pdf";

const T = ({ children }: { children: ReactNode }) => <p className="mt-5 font-semibold text-black/85">{children}</p>;
const S = ({ children }: { children: ReactNode }) => <p className="mt-3 font-medium text-black/80">{children}</p>;
const P = ({ children }: { children: ReactNode }) => <p className="mt-1.5">{children}</p>;
const L = ({ itens }: { itens: ReactNode[] }) => (
  <ul className="mt-1.5 list-disc space-y-1 pl-5">
    {itens.map((i, k) => (
      <li key={k}>{i}</li>
    ))}
  </ul>
);
const Obs = ({ children }: { children: ReactNode }) => <p className="mt-1.5 text-[12px] italic text-black/55">{children}</p>;

export function TextoTermosPassagens() {
  return (
    <>
      <p className="font-semibold text-black">Termos e Condições — Passagem Aérea Internacional</p>
      <p className="mt-0.5 text-black/55">Edição v1.00 · fevereiro de 2026 · Ajisaiwork Japan Agência de Viagens Ltda — CNPJ 43.544.605/0001-56</p>

      <S>Sobre esta cotação</S>
      <P>
        Os valores mostrados nesta página são de referência, por passageiro, e servem para planejamento. A tarifa final
        depende das datas, da disponibilidade e das regras da companhia aérea no momento da emissão. Nossa equipe envia a
        cotação pelo WhatsApp e a passagem só é emitida depois da sua aprovação e da confirmação do pagamento. Nenhum valor
        é cobrado nesta página.
      </P>

      <P>
        Obrigado por escolher a Ajisai como sua agência nessa oportunidade. Neste material explicamos detalhadamente como
        funcionam os serviços agregados de passagem aérea, além dos termos e condições de serviço da companhia aérea e da
        agência de viagens.
      </P>
      <P>
        O material abaixo de nenhuma forma se sobrepõe ao conteúdo disponível da própria companhia aérea em seu próprio
        site, ao direito do consumidor ou às leis brasileiras, porém torna mais didática a compreensão dos temas mais
        relevantes para o passageiro.
      </P>

      {/* ── 1 ── */}
      <T>1. Serviços auxiliares e complementares da companhia aérea e cortesias</T>
      <P>
        Além da passagem aérea, os clientes possuem acesso, nem sempre de forma gratuita, a serviços complementares
        oferecidos pela companhia aérea. Abaixo, segue a relação dos principais serviços disponíveis e a respectiva política
        de cada um deles.
      </P>

      <S>1.1. Marcação de assento de forma antecipada</S>
      <L
        itens={[
          "Permitida em voo internacional, com custo, antes do check-in online (24h antes da partida), exceto se informado de forma diferente na compra da passagem.",
          "Para solicitar a marcação, peça ao atendente pré-embarque atribuído no momento da emissão da passagem aérea, para que auxilie com esta parte quando o check-in estiver disponível. O atendente pré-embarque entrará em contato dentro de 72h antes do embarque.",
          "A marcação de assentos em voos de conexão doméstica no Brasil ou no Japão fica indisponível, pois não há integração dos sistemas das empresas aéreas internacionais com as nacionais.",
        ]}
      />

      <S>1.2. Solicitação de cadeira de rodas durante a conexão para passageiros com mobilidade reduzida, PCD ou idosos (65 anos ou mais)</S>
      <L
        itens={[
          "Permitida em voo internacional e nacional, sem custo adicional; deve ser solicitada com até 72 horas do voo.",
          "Durante as conexões, um funcionário do aeroporto fará o deslocamento do passageiro, via terrestre, na cadeira de rodas, desde o portão de embarque até a próxima conexão.",
          "Caso a assistência seja solicitada no check-in em São Paulo ou na origem no Japão, um funcionário do próprio aeroporto de origem fará o deslocamento do passageiro.",
          "Além da facilidade durante a conexão, a assistência abrange áreas restritas como raio-X, imigração e coleta de bagagens no destino.",
        ]}
      />
      <Obs>
        Obs.: não confundir o serviço com cuidado exclusivo ao passageiro. Não há monitoramento do passageiro e a assistência
        é prestada pontualmente por uma equipe terceirizada do aeroporto, e não da empresa aérea.
      </Obs>

      <S>1.3. Escolha de refeições específicas para passageiros com restrição ou preferência alimentar</S>
      <P>
        Sabemos que existem muitos passageiros que possuem diabetes, que são vegetarianos ou até mesmo veganos. Caso haja
        alguma restrição do ponto de vista alimentar, ficaremos honrados em auxiliar solicitando a refeição específica de
        acordo com a disponibilidade da companhia aérea:
      </P>
      <L
        itens={[
          "Refeição para bebê (BBML)",
          "Refeição infantil não vegetariana (CHML)",
          "Refeição vegetariana infantil (CVML)",
          "Refeição vegetariana — vegana (VGML)",
          "Refeição lacto-ovo-vegetariana (VLML)",
          "Refeição para diabéticos (DBML)",
          "Refeição sem glúten (GFML)",
          "Refeição com baixo teor de sal/sódio (LSML)",
          "Refeição sem lactose (NLML)",
          "Refeição com baixo teor de gordura/colesterol (LFML)",
        ]}
      />
      <Obs>
        Obs.: sujeito à disponibilidade e aprovação da companhia aérea. A agência não garante a disponibilidade; ela solicita
        o serviço junto à companhia aérea.
      </Obs>

      <S>1.4. Compra de bagagem extra para despacho no aeroporto</S>
      <P>
        Nem sempre as companhias aéreas oferecem esse serviço, até porque a disponibilidade de espaço no porão é calculada
        apenas no dia da viagem, após o check-in dos passageiros. Porém, quando uma empresa oferece o serviço, é possível nos
        consultar para verificar o custo de bagagem extra para despacho no balcão, de 23 kg e 150–158 cm lineares*.
      </P>
      <P>
        Os preços variam de acordo com a empresa aérea; estima-se que a variação seja entre US$ 200 e US$ 350, de acordo com
        a política vigente de cada empresa aérea.
      </P>
      <P>
        Nem sempre a companhia aérea oferece desconto para compra antecipada de bagagem, mas algumas empresas, como a
        Emirates, geralmente possuem algum tipo de diferenciação de preço em comparação com o aeroporto.
      </P>
      <P>
        É importante ressaltar que não temos suporte à política de preços de excesso de bagagem; a estimativa de preço deve
        ser feita diretamente no dia da viagem, no balcão da companhia aérea, ou consultando a informação no site da
        companhia aérea.
      </P>
      <P>
        O excesso de bagagem é responsabilidade exclusiva do passageiro, e a agência não faz verificação de peso antes do
        embarque, reservando-se apenas a informar a política vigente.
      </P>
      <Obs>*150 cm para voos da Emirates ou Qatar Airways e 158 cm para as demais empresas aéreas.</Obs>

      <S>1.5. Despacho de bagagens fora de medida, instrumentos musicais, artigos esportivos ou de outra natureza</S>
      <L
        itens={[
          <>
            <strong className="font-medium">Mala saco (“sacolão”):</strong> pode ser despachada se não ultrapassar as
            medidas lineares permitidas; consulte-nos.
          </>,
          <>
            <strong className="font-medium">Instrumentos musicais:</strong> podem ser despachados como mala extra; aplicam-se
            restrições.
          </>,
          <>
            <strong className="font-medium">Equipamentos esportivos para prática profissional:</strong> podem ser
            despachados como mala extra. Para pranchas de surfe e outros equipamentos de grande porte, é necessária uma
            autorização específica; esteja ciente de que nem sempre é possível obtê-la e de que o custo adicional pode ser
            muito acima do cobrado por uma mala extra de 23 kg.
          </>,
          <>
            <strong className="font-medium">Urna funerária:</strong> não pode ser despachada como mala extra; aplicam-se
            restrições. Consulte-nos a respeito da forma de transporte e da documentação necessária.
          </>,
          <>
            <strong className="font-medium">Animais de estimação (pet):</strong> não podem ser despachados como mala extra e
            aplicam-se diversas restrições, inclusive governamentais. Consulte-nos para mais detalhes.
          </>,
        ]}
      />
      <P>
        Não há nenhum tipo de material específico que autorize ou não determinados tipos de bagagem ou que especifique
        exatamente as dimensões de bagagens fora dos padrões. Se for o caso, consulte-nos com a maior antecedência possível,
        pois pode ser necessária autorização prévia da companhia aérea.
      </P>

      {/* ── 2 ── */}
      <T>2. Responsabilidades da agência de viagens</T>

      <S>2.1. Garantia da disponibilidade do bilhete aéreo</S>
      <P>
        Sim, a agência de viagens é responsável por garantir a existência do bilhete aéreo junto à companhia aérea e a
        conformidade do itinerário originalmente adquirido. É possível consultar a reserva e o status de emissão do bilhete,
        pelo código localizador, diretamente no site da companhia aérea, na área “Gestão de reserva” ou equivalente. Em caso
        de dúvida sobre como encontrar essa informação, é só perguntar a um dos nossos consultores.
      </P>
      <P>
        É importante ressaltar que, apesar das verificações feitas pela agência de viagens no ato da emissão, o passageiro é
        corresponsável pela validação do nome, do sobrenome e da ordem dos nomes dos passageiros, assim como da data de
        nascimento. Caso a reserva tenha sido feita com o nome incorreto, verificaremos em qual etapa do processo isso
        ocorreu; geralmente buscamos alternativas de corresponsabilidade quando a mudança de nome gera custos adicionais
        pela companhia aérea.
      </P>
      <P>
        No entanto, imprevistos podem ocorrer do lado da companhia aérea, e em caso de alterações que estejam em conformidade
        com o CDC e a regulamentação da ANAC, informaremos de forma tempestiva os passageiros sobre eventuais mudanças de
        data, horário de partida, voo ou até mesmo empresa aérea.
      </P>
      <P>
        Recomendamos que o passageiro acompanhe o status da sua reserva periodicamente no site ou no aplicativo da empresa
        aérea, para não depender exclusivamente do agente de viagens. O agente de viagens não possui responsabilidade civil
        sobre as alterações da companhia aérea, mas cumpre o papel de informar os passageiros, uma vez que esteja ciente de
        qualquer modificação relevante na reserva, dentro do período comercial ou horário de atendimento.
      </P>

      <S>2.2. Garantia de suporte em cenários adversos</S>
      <P>
        Um dos maiores diferenciais, de fato, ao comprar uma viagem com uma agência de viagens é a obtenção de suporte em
        cenários adversos. Cenários adversos são situações fora do controle do passageiro, que ocorrem por motivos diversos e
        afetam a condição de transporte até o destino final.
      </P>
      <P>Alguns exemplos de problemas em que pode ser solicitado apoio da agência pela central de atendimento:</P>
      <P>
        <strong className="font-medium">2.2.1. Cancelamento involuntário do voo</strong> pela companhia aérea (independente
        do motivo ou da antecedência).
      </P>
      <P>
        Sabemos que imprevistos podem acontecer e, independente do motivo, estaremos dispostos a auxiliar com a melhor
        solução possível para uma eventual remarcação do bilhete. Além disso, dependendo da antecedência e da forma como
        ocorrer o cancelamento, alguns direitos do consumidor se aplicam (ver a seção de direitos do consumidor).
      </P>
      <P>
        No entanto, é importante ressaltar que, antes de entrar em contato conosco, caso esteja no aeroporto, o passageiro
        deve tentar primeiro negociar uma condição favorável de remarcação no próprio aeroporto.
      </P>
      <P>
        Caso o incidente ocorra fora do território brasileiro e seja necessária comunicação em inglês ou outro idioma, a
        agência não oferece serviço 24/7 de tradução simultânea ou suporte para dialogar diretamente com a companhia aérea.
        Pode ser necessário aguardar o horário de expediente, e uma taxa extra pode ser cobrada por intervenções desta
        natureza, mesmo que o consumidor tenha direito à remarcação sem custo.
      </P>

      <S>2.3. Obrigações fiscais e tributárias para serviços prestados no Brasil ou no exterior</S>
      <P>
        A Ajisai possui obrigatoriedade fiscal e tributária limitada com relação à emissão de bilhetes aéreos e prestação de
        serviços. A emissão de nota fiscal é regida pelo art. 27 da Lei Federal nº 11.771, de 2008:
      </P>
      <P>
        <em>
          “§ 2º O preço dos serviços das agências de turismo é a soma do valor bruto das comissões recebidas dos prestadores
          dos serviços turísticos ou dos consumidores e contratantes dos serviços intermediados, acrescido de valor agregado
          ao preço de custo desses serviços, se houver sido facultada à agência de turismo a cobrança de taxa de serviço do
          consumidor pelos serviços prestados.” (Redação dada pela Lei nº 14.978, de 2024)
        </em>
      </P>
      <P>
        Isso significa que, quando o valor pago pelo cliente é exatamente o valor recolhido pela agência de viagens, a
        remuneração da intermediação ocorre pelo pagamento de comissão da companhia aérea. A nota fiscal de prestação de
        serviços, quando emitida, é emitida em nome da companhia aérea, e não do passageiro ou responsável legal. Em outras
        palavras, não é emitida nota fiscal ao cliente no seu CPF (pessoa física), exceto em situações em que o pagamento de
        comissionamento não ocorrer de forma direta, ou seja, quando o valor do serviço for gerado dentro da própria Ajisai.
        Para a emissão da nota fiscal, é compreendido apenas o que está mencionado no art. 27, § 2º.
      </P>
      <P>
        A Ajisai, quando indagada pelo cliente, deve informar qual é o regime de apuração dos impostos e se se aplica ou não
        a emissão de NF-e, não cabendo contestação por parte do cliente, exceto por vias judiciais.
      </P>

      {/* ── 3 ── */}
      <T>3. Responsabilidades da companhia aérea</T>

      <S>3.1. Responsabilidade objetiva do bilhete aéreo</S>
      <P>
        A responsabilidade objetiva se configura quando o prestador de serviço é quem recebe integralmente o repasse do
        pagamento feito pelo cliente ao agente de viagens e controla os meios de prestação do serviço. Assim, em qualquer
        cenário de ruptura na prestação do serviço — seja a impossibilidade de a companhia concluir a viagem por motivos
        diversos, sejam danos causados ao passageiro ou às suas bagagens —, a companhia aérea é responsável pelos danos
        causados, de acordo com as leis federais vigentes e a regulamentação da ANAC ou da IATA.
      </P>
      <P>
        A companhia aérea possui responsabilidade objetiva por ser efetivamente a empresa que presta o serviço ao passageiro:
        além de operar o avião, é responsável pela logística, manutenção e comunicação pelos canais com o cliente, equipe de
        aeroporto e agente de viagens.
      </P>
      <P>
        Isso significa que, quando há um problema na prestação do serviço, a situação deve ser direcionada diretamente à
        companhia aérea. A agência de viagens não possui responsabilidade objetiva do ponto de vista civil em situações como
        cancelamentos involuntários, atrasos, problemas na prestação de serviços, danos à mala do passageiro ou problemas
        diversos decorrentes de prestação de serviço inadequada ou ineficiente da companhia aérea. A atuação da agência é de
        intermediadora na obtenção do bilhete aéreo, e não de executora do serviço de transporte de passageiros.
      </P>
      <P>
        Em caso de disputa com relação a algum dano material ou prejuízo causado pela companhia aérea, procure diretamente os
        canais de suporte ao consumidor no aeroporto ou online e, caso o problema não seja resolvido, a ouvidoria da empresa
        ou os órgãos de defesa do consumidor.
      </P>
      <P>
        Caso a agência seja citada como testemunha em um processo civil, nos reservamos o direito de nos posicionar conforme
        as leis permitem. E, caso a agência seja colocada como ré em processo civil de forma inapropriada segundo as leis, não
        serão medidos esforços indenizatórios para reversão da causa, com dano moral e material causado à nossa empresa e
        marca.
      </P>

      <S>3.2. Responsabilidade de tratativas em cenários adversos</S>
      <P>
        Por possuir responsabilidade objetiva, a companhia aérea deve também atuar para buscar soluções em qualquer cenário
        adverso de disrupção na prestação de serviços. Abaixo, alguns exemplos de situações que devem ser tratadas diretamente
        com a companhia aérea, buscando uma solução enquanto houver possibilidade e tempo hábil:
      </P>
      <L
        itens={[
          <>
            <strong className="font-medium">Perda involuntária de voo de conexão:</strong> em caso de perda de conexão por
            tempo curto (menos de 40 minutos), procure um balcão da companhia aérea para buscar realocação no próximo voo
            disponível. Em conexões acima de 40 minutos e até 2 horas, pode ser necessário apresentar uma justificativa
            plausível para a perda da conexão e a realocação no próximo voo disponível. Nem sempre o próximo voo disponível
            ocorrerá no mesmo dia, e a obrigatoriedade de remanejar o itinerário completo só existe quando o itinerário foi
            vendido em conjunto, na mesma reserva/localizador.
          </>,
          <>
            <strong className="font-medium">Assistência material e reacomodação*:</strong> em caso de atrasos ou
            cancelamentos, a companhia aérea tem a obrigação de prestar assistência material aos passageiros, de acordo com
            as leis vigentes — como alimentação, hospedagem e comunicação — enquanto aguardam a resolução do problema. Além
            disso, deve oferecer opções de reacomodação em outros voos ou reembolso da passagem.
          </>,
          <>
            <strong className="font-medium">Danos morais e materiais:</strong> atrasos e cancelamentos podem gerar danos
            morais devido ao desconforto, à frustração e aos transtornos causados aos passageiros. Além disso, se o passageiro
            tiver prejuízos financeiros comprovados, como gastos com nova passagem ou hospedagem, a companhia aérea pode ser
            responsabilizada por danos materiais.
          </>,
        ]}
      />
      <Obs>
        *Em caso de desastres naturais, guerras ou eventos de grande mobilização ou comoção que gerem disrupção na prestação
        de serviços, é necessário avaliar pontualmente os direitos do consumidor no caso, pois, embora seja direito do
        consumidor, nem sempre a companhia aérea dispõe de infraestrutura para resolver determinados impactos.
      </Obs>

      {/* ── 4 ── */}
      <T>4. Responsabilidades do passageiro (“viajante”)</T>
      <S>4.1. Responsabilidades gerais dos passageiros</S>
      <P>
        Os passageiros também possuem responsabilidades importantes para que o serviço seja executado da forma prevista pela
        companhia aérea. Fique atento às obrigações que, se descumpridas, podem gerar a ruptura unilateral do contrato de
        prestação de serviços ou até mesmo responsabilidades nas esferas civil e criminal. Abaixo, alguns exemplos de
        responsabilidades dos passageiros, que não são reversíveis nem passíveis de responsabilidade objetiva da agência ou da
        companhia aérea:
      </P>
      <L
        itens={[
          <>
            <strong className="font-medium">Não apresentar passaporte válido no dia da viagem:</strong> independente do
            motivo*, caso o passageiro esqueça, perca ou por qualquer motivo não tenha o passaporte para apresentar no dia da
            viagem, ele perde o direito ao embarque do voo em questão e de todos os voos seguintes da mesma reserva (mesmo o
            voo de retorno em outra data). Em caso de perda do passaporte, informe imediatamente a agência de viagens.
          </>,
          <>
            <strong className="font-medium">Não apresentar visto válido para conexão internacional ou para o país de
            destino:</strong> é obrigação do passageiro possuir a documentação necessária para a viagem. Sem visto válido, ele
            perde o direito ao embarque do voo em questão e de todos os voos seguintes da mesma reserva. Obs.: se houver
            trechos com necessidade de visto, a agência de viagens informará o passageiro no momento da emissão das
            passagens.
          </>,
          <>
            <strong className="font-medium">Menor que viaja sozinho ou acompanhado de apenas um dos pais:</strong> é
            obrigatório apresentar autorização de viagem impressa no passaporte ou termo de acordo com as regras do CNJ,
            Infraero e Polícia Federal. A agência não se responsabiliza por passageiros com documentação insuficiente no
            momento da viagem; em caso de dúvida, consulte a Polícia Federal ou a agência de viagens com antecedência.
          </>,
          <>
            <strong className="font-medium">Não cumprir os requisitos sanitários de entrada no país de destino e/ou das
            conexões internacionais:</strong> alguns países exigem vacinas e comprovação para entrada; caso o passageiro não
            cumpra esses requisitos, pode ser impedido de embarcar ou desembarcar. Havendo necessidade de comprovação
            sanitária, a agência de viagens informará o passageiro no momento da emissão das passagens.
          </>,
          <>
            <strong className="font-medium">Perda voluntária de voo ou conexão:</strong> independente do motivo*, caso o
            passageiro não compareça no horário do check-in e no portão de embarque informados pela companhia aérea, ele
            perde o direito ao embarque do voo em questão e de todos os voos seguintes da mesma reserva (mesmo o voo de
            retorno em outra data).
          </>,
          <>
            <strong className="font-medium">Perda de voo por recusar-se a embarcar:</strong> independente do motivo*, o
            passageiro perde o direito ao embarque do voo em questão e de todos os voos seguintes da mesma reserva (mesmo o
            voo de retorno em outra data).
          </>,
          <>
            <strong className="font-medium">Má conduta nas dependências do aeroporto ou da aeronave:</strong> não cabe a nós
            avaliar o que seriam condutas inapropriadas, mas geralmente agressões verbais ou físicas a passageiros,
            funcionários do aeroporto ou tripulação acarretam a expulsão do passageiro e a perda do direito ao embarque do
            voo em questão e de todos os voos seguintes da mesma reserva (mesmo o voo de retorno em outra data).
          </>,
          <>
            <strong className="font-medium">Transporte de substâncias ilícitas (ex.: drogas):</strong> o passageiro em
            nenhuma hipótese pode transportar substâncias proibidas; se for comprovada a intenção ou o transporte, responderá
            na esfera criminal, além de perder o direito ao voo e aos seguintes da reserva.
          </>,
        ]}
      />
      <P>
        Outros problemas apontados ao passageiro, não listados acima, que sejam contravenções às leis locais também podem ser
        motivo de não embarque. Passageiros impedidos de embarcar pela Polícia Federal ou órgão equivalente fora do Brasil
        não têm direito ao bilhete emitido nos trechos remanescentes.
      </P>
      <Obs>*Casos de guerra, desastres naturais ou óbito do passageiro devem ser avaliados caso a caso.</Obs>

      {/* ── 5 ── */}
      <T>5. Direitos do consumidor — CDC brasileiro</T>
      <S>5.1. Disposições gerais e trechos do Código de Defesa do Consumidor (CDC) para consulta do cliente</S>
      <P>
        Viagens aéreas são particularmente suscetíveis a atrasos, cancelamentos e overbooking (venda de assentos além da
        capacidade). A legislação brasileira, regulamentada pela Agência Nacional de Aviação Civil (ANAC) e pelo CDC, garante
        os direitos abaixo em caso de problemas com voos, de responsabilidade da companhia aérea ou do agente de viagens.
      </P>
      <P>
        <strong className="font-medium">Assistência material — companhia aérea:</strong>
      </P>
      <L
        itens={[
          "Em caso de atraso superior a 1 hora, as companhias devem oferecer meios de comunicação (telefone ou internet).",
          "Após 2 horas, o passageiro tem direito a alimentação (vouchers ou refeição).",
          "Após 4 horas, a empresa deve proporcionar acomodação ou hospedagem, além de transporte até o local.",
        ]}
      />
      <P>
        <strong className="font-medium">Reembolso ou reacomodação — companhia aérea:</strong> para voos cancelados ou com
        atrasos superiores a 4 horas, o passageiro pode escolher entre:
      </P>
      <L
        itens={[
          "Reacomodação em outro voo (da mesma companhia ou de outra, sem custo adicional);",
          "Execução do serviço por outro meio de transporte;",
          "Reembolso total do valor pago.",
        ]}
      />
      <P>
        <strong className="font-medium">Informação transparente — companhia aérea:</strong> as empresas aéreas são obrigadas a
        informar, em tempo real, a situação do voo e os motivos de qualquer problema.
      </P>
      <P>
        <strong className="font-medium">Alterações em pacotes turísticos — agente de viagens:</strong> pacotes turísticos,
        frequentemente comprados para viagens em família ou em grupo, também possuem proteções importantes:
      </P>
      <L
        itens={[
          "Alterações unilaterais: a agência de turismo não pode alterar itinerários, hospedagens ou outros serviços sem o consentimento do cliente. Caso isso ocorra, o consumidor tem direito a cancelar o contrato com reembolso integral ou aceitar outro pacote de valor igual ou superior, sem custos adicionais.",
          "Cancelamento pelo consumidor: o cliente pode cancelar o pacote antes da viagem, mas pode haver cobrança de multas proporcionais, desde que previstas em contrato. O CDC exige que essas multas sejam razoáveis e comunicadas de forma clara.",
          "Descumprimento do contrato: se a agência não cumprir o que foi contratado (como hotel diferente do acordado), o consumidor pode exigir reparação ou até indenização por danos morais e materiais.",
        ]}
      />
      <P>
        Fontes: Código de Defesa do Consumidor (gov.br/mj — CDC), “Conheça seus direitos em viagens e serviços de turismo”
        (gov.br/mj) e jurisprudência do TJDFT sobre aplicabilidade do CDC ao transporte aéreo.
      </P>

      {/* ── 6 ── */}
      <T>6. Política de alteração ou cancelamento do bilhete aéreo — alterações voluntárias</T>
      <P>
        Imprevistos acontecem, e nem sempre o passageiro consegue cumprir a programação da viagem do bilhete emitido. Abaixo,
        a política de alteração voluntária válida para o seu bilhete aéreo emitido conosco. Ela tem fundamento nas políticas
        de alteração e cancelamento da companhia aérea, mas não exclusivamente.
      </P>
      <P>
        O conteúdo abaixo vale exclusivamente para alterações voluntárias, ou seja, aquelas pleiteadas unicamente pela vontade
        do passageiro ou responsável legal. Segue a relação de situações e custos atrelados a mudanças voluntárias, exceto se
        informado de forma diferente no ato da emissão do bilhete aéreo.
      </P>
      <P>
        <strong className="font-medium">
          Bilhetes emitidos pela JAL (Japan Airlines), ANA (All Nippon Airways), American Airlines, United e Delta Airlines
          não são elegíveis a alteração ou cancelamento em nenhuma hipótese, ANTES ou DEPOIS da partida.
        </strong>
      </P>
      <P>Para as demais companhias aéreas e bilhetes emitidos com origem no Brasil ou no Japão, segue a política em vigor:</P>
      <L
        itens={[
          <>
            <strong className="font-medium">Remarcação ANTES da partida programada (até 48h antes):</strong> multa de US$ 250
            + US$ 30 de taxa de serviço, mais a diferença tarifária para o novo trecho selecionado.
          </>,
          <>
            <strong className="font-medium">Remarcação DEPOIS da partida programada:</strong> não remarcável após “no-show”;
            o bilhete fica inutilizável depois do “no-show”, incluindo os trechos seguintes não voados.
          </>,
          <>
            <strong className="font-medium">Cancelamento ANTES da partida programada:</strong> não reembolsável, exceto se
            informado de forma diferente pela equipe de atendimento no ato da emissão. O cancelamento é possível, mas não
            resultará em reembolso, nem parcial.
          </>,
          <>
            <strong className="font-medium">Cancelamento DEPOIS da partida programada:</strong> não é elegível a cancelamento
            ou reembolso. Em caso de “no-show”, incluem-se os trechos seguintes não voados.
          </>,
        ]}
      />
      <Obs>
        *Alguns bilhetes podem ser elegíveis a reembolso parcial de até 50% do valor pago se o cancelamento for solicitado
        ANTES da partida, com pelo menos 48 horas de antecedência, e se o bilhete não tiver sido emitido dentro de 1 semana
        da data de início da viagem. Consulte um dos nossos consultores para avaliar pontualmente o seu caso.
      </Obs>
      <Obs>
        **Exceção de acordo com o CDC: casos de desistência voluntária no mesmo dia da emissão do bilhete, para compras
        feitas de forma remota, são elegíveis a reembolso integral, exceto quando o voo for em menos de 1 semana da data da
        emissão — nesse caso, o CDC anula essa condição de reembolso. Essa regra vale apenas para emissões com ORIGEM no
        Brasil; o CDC brasileiro não se aplica ao Japão, portanto não há essa exceção de reembolso para emissões no Japão.
      </Obs>

      <T>Dúvidas</T>
      <P>
        Em caso de dúvidas, entre em contato com a central de atendimento pelo WhatsApp +55 (11) 9-3030-0101 ou pelo e-mail
        atendimento@ajisaiwork.com.br. Ficaremos gratos em atender e auxiliar da melhor forma possível.
      </P>
      <p className="mt-4 text-black/55">Fim dos Termos e Condições.</p>
    </>
  );
}
