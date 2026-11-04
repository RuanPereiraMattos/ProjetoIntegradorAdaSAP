# Parte 1 — Visão do Produto

## Status: [x] Concluída

---

## 1.1 Problema

Empresas de médio porte perdem receita por não identificar clientes em risco de churn a tempo e por não ter visibilidade consolidada do pipeline de vendas. Gestores tomam decisões com dados dispersos em planilhas, sem alertas automáticos — o que resulta em oportunidades perdidas, follow-ups esquecidos e cancelamentos que poderiam ter sido evitados.

**Inspiração de mercado:** O SAP Sales Cloud (parte do portfólio SAP CX) resolve exatamente este problema para grandes empresas. O **NexusVendas** traz essa inteligência para médias empresas, com foco em insights acionáveis no ciclo transação → regra de negócio → insight → ação.

---

## 1.2 Usuários

| Persona | Papel | Dor principal |
|---|---|---|
| Gerente Comercial | Acompanha metas, pipeline e receita | Não tem visão consolidada do funil de vendas |
| Vendedor | Registra pedidos e oportunidades | Perde follow-ups por falta de alertas automáticos |
| Analista de CX | Monitora NPS, satisfação e churn | Dados de satisfação separados das transações de venda |

---

## 1.3 User Stories

### US-01 — Visão do pipeline em tempo real
**Como** Gerente Comercial, **quero** visualizar o funil de vendas com as oportunidades em cada etapa e suas taxas de conversão, **para** identificar gargalos e agir antes de perder negócios no mês.

**Critérios de aceite:**
- [x] O dashboard exibe contagem e valor total de oportunidades por etapa (prospecção, proposta, negociação, fechado)
- [x] A taxa de conversão entre etapas é calculada automaticamente
- [x] Etapas com conversão abaixo de 30% exibem alerta visual

### US-02 — Alerta de clientes em risco de churn
**Como** Analista de CX, **quero** receber automaticamente uma lista de clientes que não compram há mais de 90 dias com o ticket médio histórico, **para** priorizar ações de reativação antes que o cliente cancele.

**Critérios de aceite:**
- [x] A lista atualiza diariamente com clientes inativos há ≥ 90 dias
- [x] Cada item exibe: nome, dias sem compra, ticket médio e ação sugerida
- [x] Clientes com ticket médio > R$3.000 recebem ação diferenciada (desconto 10%)

### US-03 — Alerta de NPS crítico
**Como** Analista de CX, **quero** ser notificado quando um cliente registrar 3 ou mais avaliações consecutivas com nota ≤ 6, **para** acionar o time de Customer Success antes que o cliente se torne um detrator público.

**Critérios de aceite:**
- [x] O sistema avalia as últimas 3 avaliações de cada cliente após cada nova resposta
- [x] Quando a condição é atingida, o cliente aparece no painel de alertas com status "NPS Crítico"
- [x] O alerta inclui as notas recentes e botão de acionamento do CS

---

## 1.4 MVP

**Dentro do MVP:**
- [x] Dashboard com 4 KPIs (Receita do mês, Pedidos ativos, Clientes em risco, NPS médio)
- [x] Gestão de clientes (CRUD)
- [x] Gestão de pedidos (CRUD + atualização de status)
- [x] Painel de oportunidades com funil de vendas
- [x] 3 insights automáticos: churn risk, NPS crítico, gargalo no funil
- [x] Autenticação JWT com roles (admin, gerente, vendedor)

**Fora do MVP (backlog futuro):**
- [ ] Integração com e-mail para disparo automático de ofertas
- [ ] Relatórios exportáveis em PDF
- [ ] Módulo de campanhas de marketing
- [ ] Predição de churn por ML
- [ ] App mobile

---

## 1.5 Backlog resumido

| ID | Funcionalidade | Prioridade | MVP? |
|---|---|---|---|
| F-01 | Dashboard com KPIs e alertas | Alta | Sim |
| F-02 | CRUD de clientes com status de risco | Alta | Sim |
| F-03 | CRUD de pedidos com controle de status | Alta | Sim |
| F-04 | Funil de oportunidades | Alta | Sim |
| F-05 | Insight: churn risk (≥ 90 dias sem compra) | Alta | Sim |
| F-06 | Insight: NPS crítico (3× nota ≤ 6) | Alta | Sim |
| F-07 | Insight: gargalo no funil (conversão < 30%) | Média | Sim |
| F-08 | Autenticação e autorização por role | Alta | Sim |
| F-09 | Disparo de e-mail de reativação | Média | Não |
| F-10 | Relatórios exportáveis em PDF | Baixa | Não |
| F-11 | Predição de churn por ML | Baixa | Não |

---

## 1.6 Insights previstos

Cada insight segue o padrão: **o que aconteceu → por que importa → ação sugerida**

| # | O que aconteceu | Por que importa | Ação sugerida |
|---|---|---|---|
| I-01 | Beta Distribuidora sem compra há 118 dias | Ticket médio era R$4.200/mês — receita recorrente em risco | Enviar oferta de reativação com 10% de desconto |
| I-02 | Gama Serviços recebeu notas 5, 4 e 3 nas últimas 3 avaliações | Cliente detrator pode cancelar e prejudicar reputação | Acionar Customer Success imediatamente |
| I-03 | Conversão de Proposta → Negociação está em 22% (meta: 30%) | Meta de receita do mês em risco se não corrigido esta semana | Revisar script de abordagem na etapa de proposta |
