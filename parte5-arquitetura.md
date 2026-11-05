# Parte 5 — Arquitetura da Solução

## Status: [x] Concluída

---

## 5.1 Componentes da Solução

```
┌────────────────────────────────────────────────────────────┐
│                    USUÁRIO FINAL                           │
│          Navegador Web — React SPA (Vite)                  │
│     Dashboard · Pedidos · Clientes · Insights              │
└───────────────────────────┬────────────────────────────────┘
                            │ HTTPS / REST JSON
                            │ Authorization: Bearer JWT (token do ERP)
┌───────────────────────────▼────────────────────────────────┐
│              API — Node.js + Express                       │
│                                                            │
│  ┌──────────────┐  ┌────────────────┐  ┌───────────────┐  │
│  │ Rotas REST   │  │  Controllers   │  │   Services    │  │
│  │ /clientes    │→ │ Validação HTTP │→ │ Regras de     │  │
│  │ /pedidos     │  │ authMiddleware │  │ negócio e     │  │
│  │ /insights    │  │ (valida JWT)   │  │ insights      │  │
│  └──────────────┘  └────────────────┘  └───────┬───────┘  │
│                                                │          │
│                                      ┌─────────▼────────┐ │
│                                      │   Repository     │ │
│                                      │   Queries SQL    │ │
│                                      └─────────┬────────┘ │
└────────────────────────────────────────────────┼──────────┘
                                                 │ SQL
┌────────────────────────────────────────────────▼──────────┐
│              Banco de Dados — PostgreSQL (RDS)             │
│   clientes · pedidos · itens_pedido · produtos             │
│   oportunidades · avaliacoes_nps · audit_log               │
└────────────────────────────┬───────────────────────────────┘
                             │
                    ↑ Batch sync diário às 02h
        (EventBridge Scheduler → Lambda SyncJob → RDS)
                             │
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─▼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
  ERP Corporativo (fonte de dados)

  pedidos · clientes · avaliacoes_nps · produtos
│                                                           │
  EventBridge Scheduler (02h) → Lambda SyncJob → RDS
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

---

## 5.2 Padrão Arquitetural: Camadas (MVC Simplificado)

**Justificativa:** O padrão de camadas é o natural do Express + Node.js, separa responsabilidades claramente e facilita testes unitários nas regras de insight sem precisar de banco real.

| Camada | Responsabilidade | Tecnologia |
|---|---|---|
| **View** | Renderização de UI, componentes React, chamadas à API | React + Vite |
| **Controller** | Receber requisição HTTP, validar payload, chamar Service | Express.js |
| **Service** | Regras de negócio, cálculo de insights, lógica de domínio | Node.js (puro) |
| **Repository** | Queries SQL, mapeamento objeto-relacional | node-postgres (`pg`) |
| **Database** | Persistência relacional | PostgreSQL |

---

## 5.3 Serviços AWS Previstos

| Serviço AWS | Uso no NexusVendas |
|---|---|
| **Elastic Beanstalk** | Deploy e gerenciamento da API Node.js (auto-scaling incluso) |
| **RDS (PostgreSQL)** | Banco de dados gerenciado com backups automáticos |
| **S3 + CloudFront** | Hosting do build estático do React com CDN global |
| **Secrets Manager** | JWT secret e credenciais do banco — nunca em código |
| **CloudWatch Logs** | Logs de aplicação (erros, tempo de resposta) |
| **CloudWatch Alarms** | Alertas automáticos (CPU > 80%, taxa de erro > 1%) |
| **EventBridge Scheduler** | Dispara a Lambda SyncJob às 02h00 diariamente (EventBridge não invoca EC2/Beanstalk diretamente) — copia pedidos, clientes e avaliações NPS do ERP para o RDS |
| **Lambda SyncJob** | Função Node.js dedicada invocada pelo EventBridge; executa UPSERTs no RDS e registra no CloudWatch Logs |

---

## 5.4 Fluxo de Requisição — GET /insights/churn-risk

```
1. Gerente abre o Dashboard no React
2. React dispara GET /insights/churn-risk?dias=90
   com header: Authorization: Bearer <JWT>
3. Express executa middleware de autenticação
   → valida JWT, extrai role do usuário
4. Controller chama InsightService.getChurnRisk(90)
5. Service executa a regra:
   a. Repository.getClientesSemPedido(90) → SQL query
   b. Para cada cliente: Repository.getTicketMedio(id)
   c. Monta lista com ação sugerida por faixa de ticket
6. Controller retorna JSON 200 com a lista
7. React renderiza os cards de alerta no Dashboard
```

---

## 5.5 Conexão com SAP CX

O NexusVendas implementa, em escala de médias empresas, os mesmos conceitos do **SAP Sales Cloud**:

| Conceito SAP Sales Cloud | Implementação NexusVendas |
|---|---|
| Pipeline de oportunidades | Tabela `oportunidades` + endpoint `/insights/pipeline` |
| Deal scoring (risco de perda) | Regra I-03: conversão de funil abaixo de 30% |
| Customer churn prediction | Regra I-01: dias sem compra + ticket médio |
| NPS e Voice of Customer | Tabela `avaliacoes_nps` + Regra I-02 |
| Audit trail | Tabela `audit_log` em todas as operações |
