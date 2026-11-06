# Parte 4 — Identidade Visual

## Status: [x] Concluída

---

## 4.1 Nome e Conceito do Produto

**Nome:** NexusVendas

**Conceito:**
> Plataforma de inteligência comercial que conecta transações, relacionamentos e insights em um único painel — inspirada no SAP Sales Cloud, desenhada para empresas de médio porte que precisam agir antes de perder receita.

**Tagline:** _Venda mais. Perca menos. Decida melhor._

---

## 4.2 Paleta de Cores

| Papel | Cor (hex) | Uso |
|---|---|---|
| Primária | `#1E40AF` | Botões principais, cabeçalhos, links ativos |
| Secundária | `#3B82F6` | Cards, ícones, destaques secundários |
| Alerta/Risco | `#F59E0B` | Badges "em risco", alertas de churn e NPS |
| Crítico | `#EF4444` | Status crítico, NPS detrator, erro |
| Sucesso | `#10B981` | Status "entregue", meta atingida |
| Fundo | `#F8FAFC` | Background das telas |
| Texto | `#1E293B` | Tipografia principal |

**Referência visual:** Azul corporativo (confiança e precisão) com âmbar e vermelho para alertas — padrão utilizado por produtos SAP CX e ferramentas de BI empresarial.

---

## 4.3 Tipografia

| Papel | Fonte | Tamanho | Peso |
|---|---|---|---|
| Títulos (H1) | Inter | 32px | Bold (700) |
| Subtítulos (H2) | Inter | 24px | SemiBold (600) |
| Corpo | Inter | 16px | Regular (400) |
| Labels e dados | Inter | 14px | Medium (500) |
| Caption / tags | Inter | 12px | Regular (400) |

**Fonte:** Inter (Google Fonts — gratuita, legível em dashboards)

---

## 4.4 Componentes-chave

| Componente | Descrição |
|---|---|
| **KPI Card** | Número grande + label + variação % (verde/vermelho) |
| **Badge de status** | Pill colorido: azul (ativo), âmbar (em risco), cinza (inativo), vermelho (crítico) |
| **Tabela de pedidos** | Colunas sortáveis, filtros inline, paginação |
| **Funil de oportunidades** | Barras horizontais por etapa com contagem e proporção de estoque entre etapas |
| **Gráfico de linha** | Vendas mensais por `data_pedido`, com período e regra exibidos no contexto do KPI (Recharts) |
| **Card de insight** | Fundo âmbar/azul com ícone de alerta, texto em 3 partes e botão de ação |

---

## 4.5 Wireframes das 3 Telas

### Tela 1 — Dashboard (visão geral)

> _Valores do wireframe são ilustrativos — em produção são calculados dinamicamente pela API a partir dos dados do banco._

```
┌──────────────────────────────────────────────────────────┐
│  🔷 NexusVendas                         Ana Lima ▼       │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ Vendas mês   │ Pedidos      │ Em Risco     │ Média notas │
│ R$ 37.600    │ 12 não canc. │ ⚠ 3 alertas  │ 6,9 (0–10)  │
│ ↑ +166,7%    │ 3 pendentes  │              │              │
├──────────────┴──────────────┴──────────────┴─────────────┤
│  Vendas por mês (data do pedido)                          │
│  [gráfico de linha — Jul Ago Set Out]                    │
├──────────────────────────────────────────────────────────┤
│  ⚠ Alertas de Insight                                    │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 🔴 Beta Distribuidora — 118 dias sem compra          │ │
│  │    Ticket médio: R$4.200 → Enviar oferta 10% desc.  │ │
│  │                                          [Acionar]  │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │ 🔴 Gama Serviços — NPS crítico (notas: 5, 4, 3)     │ │
│  │    Risco de cancelamento → Acionar CS               │ │
│  │                                          [Acionar]  │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

> **Contexto do KPI:** amostra com data de referência em 05/11/2024; “Vendas mês” é a soma de `valor_total` dos pedidos não cancelados pela `data_pedido`. O cartão mostra o último mês fechado (outubro/2024) e compara com setembro/2024.

---

### Tela 2 — Lista de Pedidos

```
┌──────────────────────────────────────────────────────────┐
│  ← Dashboard    Pedidos                  [+ Novo Pedido] │
├──────────────────────────────────────────────────────────┤
│  [Status ▼]  [Cliente ▼]  [Período ▼]        🔍 Buscar  │
├──────┬──────────────────┬──────────┬───────────┬─────────┤
│  ID  │ Cliente          │ Valor    │ Status    │ Ações   │
├──────┼──────────────────┼──────────┼───────────┼─────────┤
│  9   │ Iota Financeira  │ R$15.000 │ ✅ Aprv.  │ 👁 ✏   │
│  7   │ Alfa Tecnologia  │  R$9.200 │ ⏳ Pend.  │ 👁 ✏   │
│  11  │ Delta Indústria  │  R$4.500 │ ⏳ Pend.  │ 👁 ✏   │
│  1   │ Alfa Tecnologia  │  R$8.500 │ ✅ Entg.  │ 👁      │
│  2   │ Beta Distrib.    │  R$4.200 │ ⚠ Atras. │ 👁      │
│  3   │ Gama Serviços    │  R$1.850 │ ⚠ Atras. │ 👁      │
└──────┴──────────────────┴──────────┴───────────┴─────────┘
│  Mostrando 1–6 de 12          [< 1 2 >]                  │
└──────────────────────────────────────────────────────────┘
```

---

### Tela 3 — Detalhe do Cliente

```
┌──────────────────────────────────────────────────────────┐
│  ← Lista de Clientes                                     │
│  Beta Distribuidora S.A.              ⚠ EM RISCO        │
│  Segmento: Varejo  |  Campinas, SP  |  desde Jan/2023   │
├──────────────────┬──────────────────┬────────────────────┤
│ Ticket Médio     │ Total de Pedidos │ Último Pedido      │
│ R$ 4.200         │ 1 pedido         │ 10/07/2024         │
│                  │                  │ 118 dias atrás     │
├──────────────────┴──────────────────┴────────────────────┤
│  NPS ao longo do tempo                                   │
│  [gráfico de linha — notas 8 → 7 → 6 → decaindo]        │
├──────────────────────────────────────────────────────────┤
│  Histórico de Pedidos                                    │
│  #2 · R$4.200 · Jul/2024 · ⚠ Entregue com atraso        │
├──────────────────────────────────────────────────────────┤
│  💡 Insight Recomendado                                  │
│  Cliente sem compra há 118 dias. Ticket médio de         │
│  R$4.200 por pedido representa receita em risco.         │
│  → Enviar oferta de reativação com 10% de desconto       │
│                                   [Enviar Oferta]        │
└──────────────────────────────────────────────────────────┘
```

---

## 4.6 Links e Artefatos

- [x] Wireframes HTML gerados: `wireframes.html` — abra no navegador para visualizar as 3 telas
- [ ] Link Figma/Canva com a prancha visual: _[cole aqui após criar]_
- [ ] Exportar prancha como PNG para incluir no documento final
