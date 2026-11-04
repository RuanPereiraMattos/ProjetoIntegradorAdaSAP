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
| **Funil de oportunidades** | Barras horizontais por etapa com contagem e taxa de conversão |
| **Gráfico de linha** | Receita mensal dos últimos 6 meses (Recharts) |
| **Card de insight** | Fundo âmbar/azul com ícone de alerta, texto em 3 partes e botão de ação |

---

## 4.5 Wireframes das 3 Telas

### Tela 1 — Dashboard (visão geral)

```
┌──────────────────────────────────────────────────────────┐
│  🔷 NexusVendas                         Ana Lima ▼       │
├──────────────┬──────────────┬──────────────┬─────────────┤
│ Receita/mês  │ Pedidos      │ Em Risco     │ NPS Médio   │
│ R$ 68.200    │ 12 ativos    │ ⚠ 2 clientes │ 7,4         │
│ ↑ +12%       │ 3 pendentes  │              │ ▼ -0,3      │
├──────────────┴──────────────┴──────────────┴─────────────┤
│  Receita dos últimos 6 meses                             │
│  [gráfico de linha — Mai Jun Jul Ago Set Out]            │
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
│  R$4.200/mês representa receita recorrente em risco.     │
│  → Enviar oferta de reativação com 10% de desconto       │
│                                   [Enviar Oferta]        │
└──────────────────────────────────────────────────────────┘
```

---

## 4.6 Links e Artefatos

- [x] Wireframes HTML gerados: `wireframes.html` — abra no navegador para visualizar as 3 telas
- [ ] Link Figma/Canva com a prancha visual: _[cole aqui após criar]_
- [ ] Exportar prancha como PNG para incluir no documento final
