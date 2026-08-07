# CRM Alpinea — setup

CRM interno em `/crm`, protegido por login (só colaboradores autenticados
acessam). Construído em Next.js dentro do próprio site, com Supabase como
banco de dados e autenticação.

## 1. Criar o projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um projeto novo (ou
   use um que você já tenha).
2. Em **Project Settings → API**, copie:
   - `Project URL`
   - `publishable` key (`sb_publishable_...`) — na tela "Connect", aba `.env.local`

## 2. Rodar o schema do banco

1. No painel do Supabase, abra **SQL Editor**.
2. Cole todo o conteúdo de `supabase/schema.sql` (neste repositório) e
   execute. Isso cria as tabelas `clientes`, `interacoes`, `perfis`, o
   funil de estágios e as permissões de acesso.
3. Se o schema já tinha sido rodado antes, rode também, uma única vez
   cada:
   - `supabase/migrations/002_produtos_e_data_viagem.sql` — adiciona os
     campos de produto principal/secundário e data da viagem, remove
     "tier" e "destino de interesse" e renomeia "valor_estimado" para
     "valor_proposta".
   - `supabase/migrations/003_arquivos_cliente.sql` — cria a tabela de
     arquivos/links por cliente (drafts de roteiro, propostas, etc.).
   - `supabase/migrations/004_historico_estagio.sql` — permite registrar,
     no histórico do cliente, a data em que ele entrou em cada estágio
     (alimenta o funil visual no topo da ficha do cliente).

## 3. Configurar as variáveis de ambiente

1. Copie `.env.local.example` para `.env.local` na raiz do projeto.
2. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   com os valores copiados no passo 1.
3. Para produção (Vercel): adicione as mesmas duas variáveis em
   **Project Settings → Environment Variables** e faça um novo deploy.

## 4. Criar os colaboradores (login do CRM)

1. No Supabase, vá em **Authentication → Users → Add user**.
2. Crie um usuário com e-mail e senha para cada colaborador que vai
   acessar o CRM. Marque "Auto Confirm User" para não precisar de
   verificação por e-mail.
3. Pronto — um perfil é criado automaticamente e a pessoa já pode logar em
   `alpinea.io/crm/login`.

Não existe tela pública de cadastro — só você cria acessos, pelo painel do
Supabase.

## 5. Rodar localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000/crm`.

## O que já está pronto

- **Login** por e-mail/senha (`/crm/login`), sessão via cookie, todas as
  rotas `/crm/*` protegidas.
- **Dashboard** (`/crm`): total de clientes, novos na semana, valor em
  pipeline aberto, taxa de conversão, gráfico de novos clientes por dia
  (30 dias) e gráfico do funil por estágio.
- **Clientes** (`/crm/clientes`): lista com busca (nome/e-mail/telefone) e
  filtro por estágio.
- **Cadastro/edição** (`/crm/clientes/novo`, `/crm/clientes/[id]`): dados
  do cliente, produto principal e secundário (cards com ícone), data da
  viagem, valor da proposta, estágio, observações.
- **Histórico de interações**: registro de ligações, WhatsApp, e-mails,
  reuniões e notas por cliente, com autor e data.
- **Pipeline** (`/crm/pipeline`): visão em colunas por estágio, com opção
  de mover o cliente de estágio direto pelo card.

## Não indexação

`/crm` está bloqueado em `robots.txt` e cada página tem `noindex` — não
aparece em buscadores.

## Possíveis próximos passos

- Exportar clientes para CSV/Excel.
- Anexar arquivos (propostas em PDF) à ficha do cliente.
- Notificações (e-mail/WhatsApp) quando um cliente muda de estágio.
- Métricas por colaborador responsável.
