---
marp: true
theme: default
paginate: true
style: |
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  section {
    font-family: 'Inter', sans-serif;
    background-color: #F8FAFC;
    color: #1E293B;
    padding: 48px 56px;
  }

  h1 {
    color: #1E40AF;
    font-size: 1.8em;
    border-bottom: 3px solid #3B82F6;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  h2 {
    color: #1E40AF;
    font-size: 1.4em;
    margin-bottom: 12px;
  }

  h3 {
    color: #334155;
    font-size: 1.1em;
  }

  table {
    font-size: 0.72em;
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background-color: #1E40AF;
    color: white;
    padding: 6px 10px;
    text-align: left;
  }

  td {
    padding: 5px 10px;
    border-bottom: 1px solid #E2E8F0;
  }

  tr:nth-child(even) td {
    background-color: #F1F5F9;
  }

  code {
    background-color: #E2E8F0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    color: #1E40AF;
  }

  pre {
    background-color: #0F172A;
    color: #E2E8F0;
    padding: 16px 20px;
    border-radius: 8px;
    font-size: 0.62em;
    line-height: 1.5;
  }

  ul, ol {
    font-size: 0.88em;
    line-height: 1.8;
  }

  p {
    font-size: 0.88em;
    line-height: 1.6;
  }

  blockquote {
    border-left: 4px solid #3B82F6;
    background: #EFF6FF;
    padding: 10px 16px;
    border-radius: 0 6px 6px 0;
    font-style: normal;
    color: #1E40AF;
    font-size: 0.85em;
  }

  section.capa {
    background: linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%);
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 60px;
  }

  section.capa h1 {
    color: white;
    border-bottom: 3px solid #60A5FA;
    font-size: 3em;
    margin-bottom: 16px;
  }

  section.capa h2 {
    color: #93C5FD;
    font-size: 1.2em;
    font-weight: 400;
    border: none;
    margin-bottom: 8px;
  }

  section.capa p {
    color: #CBD5E1;
    font-size: 0.95em;
  }

  section.section-title {
    background: #1E40AF;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  section.section-title h1 {
    color: white;
    border-bottom: 3px solid #60A5FA;
    font-size: 2.2em;
  }

  section.section-title p {
    color: #BFDBFE;
    font-size: 1em;
  }

  .kpi-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin: 16px 0;
  }

  .tag-amber {
    background: #FEF3C7;
    color: #92400E;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.78em;
    font-weight: 600;
  }

  .tag-blue {
    background: #DBEAFE;
    color: #1E40AF;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 0.78em;
    font-weight: 600;
  }

  section[data-marpit-pagination]::after {
    color: #94A3B8;
    font-size: 0.75em;
  }
---

<!-- _class: capa -->
<!-- _paginate: false -->

# NexusVendas

## Plataforma Inteligente de Vendas e CX

_Transação → Regra de Negócio → Insight → Ação_

<br>

**SAP Start Coding 2026 — Projeto Integrador**
Tema 3: Vendas e Experiência do Cliente

---

## Agenda

1. **Problema e contexto** — por que isso importa
2. **Usuários e User Stories** — quem usa e o que precisa
3. **Insights** — a inteligência do produto
4. **Banco de Dados** — estrutura e dados de exemplo
5. **API REST** — endpoints e contratos
6. **Identidade Visual** — nome, paleta e wireframes
7. **Arquitetura** — componentes e padrão
8. **Evolução e Escalabilidade** — roadmap e AWS

---

<!-- _class: section-title -->

# 1. Problema e Contexto

_Por que empresas de médio porte perdem receita desnecessariamente_

---

## O Problema

> Empresas de médio porte perdem receita por não identificar clientes em risco de churn a tempo e por não ter visibilidade consolidada do pipeline de vendas.

**Consequências reais:**

- Gestores tomam decisões com dados dispersos em planilhas
- Follow-ups esquecidos = oportunidades perdidas silenciosamente
- NPS baixo é percebido **depois** do cancelamento, não antes

**Referência de mercado:** O SAP Sales Cloud (parte do portfólio **SAP CX**) resolve este problema para grandes empresas. O **NexusVendas** traz essa inteligência para médias empresas.

---

## O Produto: NexusVendas

> **Plataforma de inteligência comercial** que conecta transações, relacionamentos e insights em um único painel.
>
> _Venda mais. Perca menos. Decida melhor._

**Inspirado no SAP Sales Cloud:**

| Conceito SAP CX | Nossa implementação |
|---|---|
| Pipeline de oportunidades | Tabela `oportunidades` + `/insights/pipeline` |
| Churn prediction | Regra I-01: dias sem compra + ticket médio |
| NPS / Voice of Customer | Tabela `avaliacoes_nps` + Regra I-02 |
| Deal scoring | Regra I-03: proporção de estoque no funil |

---

<!-- _class: section-title -->

# 2. Usuários e User Stories

_Quem usa o NexusVendas e o que cada um precisa_

---

## Usuários (Personas)

| Persona | Papel | Dor principal |
|---|---|---|
| **Gerente Comercial** | Acompanha metas, pipeline e receita | Não tem visão consolidada do funil de vendas |
| **Vendedor** | Registra pedidos e oportunidades | Perde follow-ups por falta de alertas automáticos |
| **Analista de CX** | Monitora NPS, satisfação e churn | Dados de satisfação separados das transações |

---

## User Stories

**US-01 — Gerente Comercial**
> Como Gerente Comercial, quero visualizar o funil de vendas com proporção de estoque por etapa, para identificar gargalos antes de perder negócios no mês.

**Critérios de aceite:** Dashboard exibe contagem e valor por etapa · Taxa calculada automaticamente · Etapas < 30% exibem alerta

**US-02 — Analista de CX**
> Como Analista de CX, quero receber clientes inativos há ≥ 90 dias com ticket médio, para priorizar reativação antes do cancelamento.

**US-03 — Analista de CX**
> Como Analista de CX, quero ser alertada quando um cliente registrar 3 avaliações consecutivas ≤ 6, para acionar CS antes que ele se torne detrator.

---

## MVP

**Dentro do MVP:**
- Dashboard com 4 KPIs + alertas de insight
- CRUD de clientes, pedidos e oportunidades
- 3 insights automáticos: churn risk, NPS crítico, gargalo no funil
- Autenticação JWT com roles (admin, gerente, vendedor)

**Fora do MVP (futuro):**
- Disparo automático de e-mails de reativação
- Relatórios exportáveis em PDF
- Predição de churn por Machine Learning
- App mobile

---

<!-- _class: section-title -->

# 3. Insights

_O ciclo: transação → regra → insight → ação_

---

## Os 3 Insights Principais

> Todo insight tem 3 partes obrigatórias: **o que aconteceu** · **por que importa** · **ação sugerida**

| # | O que aconteceu | Por que importa | Ação sugerida |
|---|---|---|---|
| **I-01** | Beta Distribuidora sem compra há 118 dias | Ticket médio R$4.200 por pedido — receita em risco | Enviar oferta de reativação com 10% de desconto |
| **I-02** | Gama Serviços: notas NPS 5, 4 e 3 consecutivas | Cliente detrator pode cancelar e prejudicar reputação | Acionar Customer Success imediatamente |
| **I-03** | Proporção Proposta→Negociação em 22% (meta: 30%) | Meta de receita do mês em risco | Revisar script de abordagem na etapa de proposta |

---

<!-- _class: section-title -->

# 4. Banco de Dados

_7 tabelas, dicionário completo e dados de exemplo_

---

## Estrutura do Banco

**7 tabelas** centradas no cliente:

```
clientes (1) ──────< pedidos (N)
pedidos  (1) ──────< itens_pedido (N)
produtos (1) ──────< itens_pedido (N)
clientes (1) ──────< oportunidades (N)
clientes (1) ──────< avaliacoes_nps (N)
                    audit_log  ← auditoria obrigatória
```

Diagrama ER completo: _[link dbdiagram.io]_

---

## Dicionário de Dados — Tabelas Principais

**`clientes`** — id · nome · segmento · cidade · data_cadastro · status _(ativo/inativo/em_risco)_

**`pedidos`** — id · cliente_id (FK) · data_pedido · data_entrega_prev · data_entrega_real · valor_total · status _(pendente/aprovado/entregue/cancelado)_

**`oportunidades`** — id · cliente_id (FK) · etapa _(captacao/proposta/negociacao/fechado_ganho/fechado_perdido)_ · valor_estimado · data_abertura · responsavel

**`avaliacoes_nps`** — id · cliente_id (FK) · pedido_id (FK) · nota _(0–10)_ · comentario · data_avaliacao

**`audit_log`** — id · tabela · operacao _(INSERT/UPDATE/DELETE)_ · registro_id · usuario · timestamp · dados_anteriores (JSON)

---

## Dados de Exemplo e Anomalias

**Amostra de `clientes`** (10 registros fictícios):

| id | nome | segmento | status |
|---|---|---|---|
| 2 | Beta Distribuidora S.A. | Varejo | ⚠ em_risco |
| 3 | Gama Serviços Ltda | Consultoria | ⚠ em_risco |
| 9 | Iota Financeira S.A. | Financeiro | ativo |
| ... | ... | ... | ... |

**4 Anomalias intencionais:**

| # | Anomalia | Insight disparado |
|---|---|---|
| A-01 | Pedidos 2 e 3: entrega 15+ dias após o previsto | Pedido com atraso crítico |
| A-02 | Clientes 2 e 3: sem pedido há 118 e 100 dias | Risco de churn |
| A-03 | Cliente 3: notas NPS 5, 4, 3 consecutivas | Cliente detrator |
| A-04 | 9 oportunidades em proposta, apenas 2 em negociação | Gargalo no funil (22%) |

---

<!-- _class: section-title -->

# 5. API REST

_10 endpoints, token ERP via Express middleware e 3 regras de insight_

---

## Endpoints

| # | Método | Rota | Descrição |
|---|---|---|---|
| — | — | — | Sem login próprio — token JWT emitido pelo ERP, validado pelo authMiddleware |
| 1 | GET | `/clientes` | Lista clientes (filtros: status, segmento) |
| 2 | GET | `/clientes/:id` | Detalha cliente com histórico |
| 3 | POST | `/clientes` | Cria novo cliente |
| 4 | PATCH | `/clientes/:id` | Atualiza dados ou status |
| 5 | GET | `/pedidos` | Lista pedidos (filtros: status, cliente, data) |
| 6 | POST | `/pedidos` | Cria pedido com itens |
| 7 | PATCH | `/pedidos/:id/status` | Atualiza status do pedido |
| 8 | GET | `/insights/churn-risk` | Clientes sem pedido há ≥ N dias |
| 9 | GET | `/insights/nps-alertas` | Clientes com 3+ avaliações ≤ 6 |
| 10 | GET | `/insights/pipeline` | Funil com proporção de estoque por etapa |

---

## Exemplo: POST /clientes

**Requisição:**
```json
POST /clientes
Authorization: Bearer eyJhbGc...

{ "nome": "Omega Varejo Ltda", "segmento": "Varejo", "cidade": "Manaus", "status": "ativo" }
```

**Resposta 201:**
```json
{ "id": 11, "nome": "Omega Varejo Ltda", "segmento": "Varejo",
  "cidade": "Manaus", "data_cadastro": "2024-11-05", "status": "ativo" }
```

**Resposta 400:**
```json
{ "error": { "code": "CAMPO_OBRIGATORIO", "message": "O campo 'nome' é obrigatório.", "status": 400 } }
```

---

## Exemplo: GET /insights/churn-risk

**Requisição:** `GET /insights/churn-risk?dias=90`

**Resposta 200:**
```json
{
  "total": 3,
  "clientes": [
    { "id": 2, "nome": "Beta Distribuidora S.A.",
      "dias_sem_compra": 118, "ticket_medio": 4200.00,
      "acao_sugerida": "Enviar oferta de reativação com 10% de desconto" },
    { "id": 3, "nome": "Gama Serviços Ltda",
      "dias_sem_compra": 100, "ticket_medio": 1850.00,
      "acao_sugerida": "Agendar ligação de relacionamento" },
    { "id": 7, "nome": "Eta Educação S.A.",
      "dias_sem_compra": 583, "ticket_medio": null,
      "acao_sugerida": "Agendar ligação de relacionamento" }
  ]
}
```

---

## Regras de Insight — Pseudocódigo

**I-01: Churn Risk**
```
PARA CADA cliente:
  SE diasDesde(ultimoPedido) >= 90:
    SE ticketMedio > 3000 → acao = "Oferta 10% desconto"
    SENÃO → acao = "Ligar para relacionamento"
```

**I-02: NPS Crítico**
```
PARA CADA cliente:
  SE últimas 3 notas <= 6 (todas):
    → acao = "Acionar CS imediatamente"
```

**I-03: Gargalo no Funil**
```
PARA CADA par de etapas consecutivas:
  proporcao = estoque_proxima / estoque_atual
  SE proporcao < 0.30 → ALERTAR gargalo nessa transição
```

---

<!-- _class: section-title -->

# 6. Identidade Visual

_NexusVendas: nome, paleta, tipografia e wireframes_

---

## Nome, Paleta e Tipografia

**Nome:** NexusVendas · **Tagline:** _Venda mais. Perca menos. Decida melhor._

**Paleta:**

| Papel | Hex | Uso |
|---|---|---|
| Primária | `#1E40AF` | Botões, cabeçalhos |
| Secundária | `#3B82F6` | Cards, destaques |
| Alerta | `#F59E0B` | Badges "em risco", churn |
| Crítico | `#EF4444` | NPS detrator, erro |
| Sucesso | `#10B981` | Entregue, meta atingida |

**Tipografia:** Inter (Google Fonts) — Regular · Medium · SemiBold · Bold

Prancha visual completa: _[link Figma/Canva]_

---

## Wireframe — Dashboard

```
┌─────────────────────────────────────────────────────────┐
│ 🔷 NexusVendas                           Ana Lima ▼     │
├─────────────┬─────────────┬─────────────┬───────────────┤
│ R$ 37.600   │ 12 não canc.│ ⚠ 3 alertas│ Média: 6,9    │
│ Vendas out. │ Pedidos     │ Churn       │ (0–10)        │
├─────────────┴─────────────┴─────────────┴───────────────┤
│  Vendas por mês (data do pedido) [gráfico de linha]     │
├─────────────────────────────────────────────────────────┤
│  ⚠ Alertas de Insight                                   │
│  🔴 Beta Distribuidora — 118 dias sem compra            │
│     Ticket R$4.200 → Enviar oferta 10% desc. [Acionar]  │
│  🔴 Gama Serviços — NPS crítico (5,4,3) [Acionar CS]    │
└─────────────────────────────────────────────────────────┘
```

---

## Wireframes — Lista e Detalhe

**Lista de Pedidos:**
```
┌──────────────────────────────────────────────────────┐
│ Pedidos                           [+ Novo Pedido]    │
│ [Status▼] [Cliente▼] [Período▼]          🔍 Buscar  │
│ ID | Cliente           | Valor    | Status  | Ações  │
│  9 | Iota Financeira   | R$15.000 | ✅ Aprv  | 👁 ✏  │
│  2 | Beta Distribuidora| R$ 4.200 | ⚠ Atras | 👁     │
└──────────────────────────────────────────────────────┘
```

**Detalhe do Cliente:**
```
┌──────────────────────────────────────────────────────┐
│ Beta Distribuidora S.A.               ⚠ EM RISCO    │
│ Ticket Médio: R$4.200 · Último pedido: 118 dias atrás│
│ [gráfico NPS ao longo do tempo]                      │
│ 💡 Enviar oferta de reativação com 10% de desconto   │
│                                      [Enviar Oferta] │
└──────────────────────────────────────────────────────┘
```

---

<!-- _class: section-title -->

# 7. Arquitetura

_Camadas, componentes e serviços AWS_

---

## Arquitetura MVP

```
 React SPA (Vite)        ← CloudFront + S3
       │ HTTPS / REST JSON
 API Node.js + Express   ← Elastic Beanstalk
 ┌───────────────────────────────────────┐
 │  Rotas → Controllers → Services       │
 │                      → Repository     │
 └───────────────────────────────────────┘
       │ SQL
 PostgreSQL (RDS)        ← db.t3.micro, 20GB
```

**Padrão:** Camadas (MVC simplificado)

| Camada | Responsabilidade | Tecnologia |
|---|---|---|
| View | UI, componentes, chamadas à API | React + Vite |
| Controller | Receber HTTP, validar, delegar | Express.js |
| Service | Regras de insight, lógica de domínio | Node.js |
| Repository | Queries SQL | node-postgres |

---

## Serviços AWS

| Serviço | Uso |
|---|---|
| **Elastic Beanstalk** | Deploy da API Node.js com auto-scaling |
| **RDS PostgreSQL** | Banco gerenciado com backup automático |
| **S3 + CloudFront** | Hosting do React com CDN |
| **Secrets Manager** | JWT secret e credenciais do banco |
| **CloudWatch** | Logs, métricas e alarmes |

---

<!-- _class: section-title -->

# 8. Evolução e Escalabilidade

_Roadmap em 3 horizontes, gargalos, segurança e custos_

---

## Roadmap de Evolução

| Horizonte | Período | Iniciativas |
|---|---|---|
| **Curto prazo** | 0–6 meses | Deploy AWS, JWT + RBAC, 3 insights, CloudWatch, onboarding |
| **Médio prazo** | 6–18 meses | Cache Redis, fila SQS para notificações, exportação PDF, app mobile |
| **Longo prazo** | 18–36 meses | ML para churn (SageMaker), microsserviços, multitenancy, QuickSight |

---

## Gargalos e Soluções

| Gargalo | Solução |
|---|---|
| Queries lentas de insight (> 100k registros) | Índices em `pedidos(cliente_id, data_pedido)` |
| Alto volume no Dashboard | Cache Redis (TTL 5 min) para `/insights/*` |
| Cálculo síncrono cresce com a base | Jobs assíncronos via SQS + Lambda |
| Banco sobrecarregado | Read replica no RDS |
| `audit_log` acumula infinitamente | Particionamento por data + S3 Glacier |

---

## Segurança, LGPD e Observabilidade

**Segurança:**
- JWT expiração 1h + refresh token 7 dias
- RBAC: admin · gerente · vendedor
- HTTPS obrigatório (TLS 1.2+) · RDS encryption at rest
- Secrets via AWS Secrets Manager

**LGPD:** Amostra fictícia de PJ — nenhum titular real. Em produção: o módulo processa dados pessoais (`responsavel`, `usuario`, comentários NPS, claims JWT) — exige base legal, minimização, política de retenção e mascaramento para logs/exports.

**Observabilidade:**
- CloudWatch Logs: erros 4xx/5xx, latência por endpoint
- CloudWatch Alarms: CPU > 80%, erro > 1%, latência > 2s
- `GET /health` para health check automático

---

## Custos Estimados na AWS

| Serviço | Config. | Custo/mês |
|---|---|---|
| Elastic Beanstalk (EC2) | t3.micro | ~$0–10 |
| RDS PostgreSQL | db.t3.micro, 20GB | ~$15–25 |
| S3 + CloudFront | < 1GB / < 10GB | ~$2–6 |
| CloudWatch | Logs + 3 alarmes | ~$3–8 |
| Secrets Manager | 2 secrets | ~$1 |
| **Total MVP** | | **~$21–50/mês** |

> Médio prazo (+ Redis + SQS): ~$80–150/mês
> Longo prazo (microsserviços + ML): ~$300–600/mês

---

<!-- _class: capa -->
<!-- _paginate: false -->

# Obrigado

**NexusVendas** — Plataforma de Vendas e Experiência do Cliente

<br>

_Transação → Regra de Negócio → Insight → Ação_

<br>

SAP Start Coding 2026
