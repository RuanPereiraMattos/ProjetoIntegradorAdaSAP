# Parte 2 — Estrutura do Banco de Dados

## Status: [x] Concluída

---

## 2.1 Tabelas

```
clientes          ← cadastro de empresas clientes
pedidos           ← transações de compra
itens_pedido      ← produtos dentro de cada pedido
produtos          ← catálogo de produtos/serviços
oportunidades     ← pipeline de vendas (funil CRM)
avaliacoes_nps    ← pesquisas de satisfação pós-venda
audit_log         ← auditoria obrigatória de todas as operações
```

---

## 2.2 Diagrama Entidade-Relacionamento

```
clientes (1) ──────────────────< pedidos (N)
pedidos  (1) ──────────────────< itens_pedido (N)
produtos (1) ──────────────────< itens_pedido (N)
clientes (1) ──────────────────< oportunidades (N)
clientes (1) ──────────────────< avaliacoes_nps (N)
pedidos  (1) ──────────────────< avaliacoes_nps (N)  [opcional]
```

> Ferramenta recomendada para o diagrama visual: https://dbdiagram.io

---

## 2.3 Dicionário de Dados

### Tabela: `clientes`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| erp_id | VARCHAR(50) | Não | ID do cliente no ERP | UNIQUE — chave de deduplicação no batch sync |
| nome | VARCHAR(100) | Sim | Razão social da empresa | — |
| segmento | VARCHAR(50) | Não | Ex: Varejo, Tecnologia, Indústria | — |
| cidade | VARCHAR(80) | Não | Cidade sede | — |
| data_cadastro | DATE | Sim | Data de criação do registro | Default: CURRENT_DATE |
| status | ENUM | Sim | `ativo` / `inativo` / `em_risco` | Default: ativo |

### Tabela: `pedidos`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| erp_id | VARCHAR(50) | Não | ID do pedido no ERP | UNIQUE — idempotência no UPSERT do sync |
| cliente_id | INT (FK) | Sim | Empresa compradora | FK → clientes.id |
| data_pedido | DATE | Sim | Data de criação | Default: CURRENT_DATE |
| data_entrega_prev | DATE | Não | Previsão de entrega acordada | — |
| data_entrega_real | DATE | Não | Data de entrega efetiva | — |
| valor_total | DECIMAL(10,2) | Sim | Valor total do pedido | > 0 |
| status | ENUM | Sim | `pendente` / `aprovado` / `entregue` / `cancelado` | Default: pendente |

### Tabela: `itens_pedido`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| erp_id | VARCHAR(50) | Não | ID do item no ERP | UNIQUE — idempotência |
| pedido_id | INT (FK) | Sim | Pedido ao qual pertence | FK → pedidos.id |
| produto_id | INT (FK) | Sim | Produto comprado | FK → produtos.id |
| quantidade | INT | Sim | Quantidade comprada | > 0 |
| preco_unitario | DECIMAL(10,2) | Sim | Preço no momento da venda | Snapshot — não atualiza com o produto |

### Tabela: `produtos`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| erp_id | VARCHAR(50) | Não | ID do produto no ERP | UNIQUE — sincronizado do catálogo ERP |
| nome | VARCHAR(100) | Sim | Nome do produto ou serviço | — |
| categoria | VARCHAR(50) | Não | Ex: Software, Hardware, Consultoria | — |
| preco_base | DECIMAL(10,2) | Sim | Preço de referência atual | > 0 |
| ativo | BOOLEAN | Sim | Disponível para venda | Default: true |

### Tabela: `oportunidades`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| cliente_id | INT (FK) | Sim | Cliente alvo da oportunidade | FK → clientes.id |
| etapa | ENUM | Sim | `prospeccao` / `proposta` / `negociacao` / `fechado_ganho` / `fechado_perdido` | — |
| valor_estimado | DECIMAL(10,2) | Não | Receita potencial se ganhar | — |
| data_abertura | DATE | Sim | Data de início da oportunidade | Default: NOW() |
| data_fechamento_prev | DATE | Não | Previsão de fechamento | — |
| responsavel | VARCHAR(100) | Não | Vendedor responsável | — |

### Tabela: `avaliacoes_nps`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| erp_id | VARCHAR(50) | Não | ID da avaliação no ERP | UNIQUE — idempotência |
| cliente_id | INT (FK) | Sim | Cliente que avaliou | FK → clientes.id |
| pedido_id | INT (FK) | Não | Pedido relacionado à avaliação | FK → pedidos.id |
| nota | INT | Sim | Nota de 0 a 10 | Entre 0 e 10 |
| comentario | TEXT | Não | Feedback livre do cliente | — |
| data_avaliacao | DATE | Sim | Data da resposta | Default: CURRENT_DATE |

### Tabela: `audit_log` _(obrigatória)_

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| tabela | VARCHAR(50) | Sim | Nome da tabela afetada | — |
| operacao | ENUM | Sim | `INSERT` / `UPDATE` / `DELETE` | — |
| registro_id | INT | Sim | ID do registro afetado | — |
| usuario | VARCHAR(100) | Sim | Usuário que realizou a ação | — |
| timestamp | TIMESTAMPTZ | Sim | Data e hora da operação (com fuso) | Default: NOW() |
| dados_anteriores | JSON | Não | Snapshot do registro antes da mudança | Preenchido em UPDATE e DELETE |

---

## 2.4 Dados de Exemplo

### `clientes` (10 registros)

| id | nome | segmento | cidade | data_cadastro | status |
|---|---|---|---|---|---|
| 1 | Alfa Tecnologia Ltda | Tecnologia | São Paulo | 2023-03-10 | ativo |
| 2 | Beta Distribuidora S.A. | Varejo | Campinas | 2023-01-22 | em_risco |
| 3 | Gama Serviços Ltda | Consultoria | Rio de Janeiro | 2022-11-05 | em_risco |
| 4 | Delta Indústria Ltda | Indústria | Belo Horizonte | 2023-06-18 | ativo |
| 5 | Épsilon Saúde S.A. | Saúde | Porto Alegre | 2023-08-30 | ativo |
| 6 | Zeta Logística Ltda | Logística | Curitiba | 2022-09-14 | ativo |
| 7 | Eta Educação S.A. | Educação | Recife | 2023-04-02 | inativo |
| 8 | Theta Varejo Ltda | Varejo | Fortaleza | 2023-07-19 | ativo |
| 9 | Iota Financeira S.A. | Financeiro | São Paulo | 2023-02-28 | ativo |
| 10 | Kappa Agro Ltda | Agronegócio | Ribeirão Preto | 2023-05-11 | ativo |

### `pedidos` (12 registros — com anomalias A-01 e A-02)

| id | cliente_id | data_pedido | data_entrega_prev | data_entrega_real | valor_total | status |
|---|---|---|---|---|---|---|
| 1 | 1 | 2024-08-01 | 2024-08-10 | 2024-08-09 | 8500.00 | entregue |
| 2 | 2 | 2024-07-10 | 2024-07-20 | 2024-08-08 | 4200.00 | entregue |
| 3 | 3 | 2024-07-28 | 2024-08-05 | 2024-08-22 | 1850.00 | entregue |
| 4 | 4 | 2024-09-15 | 2024-09-25 | 2024-09-24 | 12000.00 | entregue |
| 5 | 5 | 2024-10-01 | 2024-10-12 | null | 3300.00 | aprovado |
| 6 | 6 | 2024-10-05 | 2024-10-15 | null | 5600.00 | aprovado |
| 7 | 1 | 2024-10-20 | 2024-10-30 | null | 9200.00 | pendente |
| 8 | 8 | 2024-09-28 | 2024-10-08 | 2024-10-07 | 2100.00 | entregue |
| 9 | 9 | 2024-10-10 | 2024-10-20 | null | 15000.00 | aprovado |
| 10 | 10 | 2024-08-20 | 2024-08-30 | 2024-08-29 | 6800.00 | entregue |
| 11 | 4 | 2024-10-25 | 2024-11-05 | null | 4500.00 | pendente |
| 12 | 6 | 2024-11-01 | 2024-11-10 | null | 3200.00 | pendente |

### `avaliacoes_nps` (anomalia A-03 nos IDs 3, 4 e 5)

| id | cliente_id | pedido_id | nota | comentario | data_avaliacao |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 9 | Entrega rápida, produto excelente | 2024-08-12 |
| 2 | 2 | 2 | 6 | Atraso na entrega prejudicou o planejamento | 2024-08-10 |
| 3 | 3 | 3 | 5 | Produto veio com defeito | 2024-08-25 |
| 4 | 3 | null | 4 | Suporte demorou a responder | 2024-09-05 |
| 5 | 3 | null | 3 | Cogitando cancelar contrato | 2024-10-01 |
| 6 | 4 | 4 | 10 | Excelente atendimento | 2024-09-26 |
| 7 | 8 | 8 | 8 | Boa experiência geral | 2024-10-09 |
| 8 | 10 | 10 | 7 | Dentro do esperado | 2024-09-01 |
| 9 | 5 | 5 | 8 | Prazo respeitado, produto conforme | 2024-10-15 |
| 10 | 9 | 9 | 9 | Ótimo atendimento comercial | 2024-10-22 |

> IDs 9 e 10 completam o mínimo de 10 registros exigido. Média das notas (0–10) dos 10 registros: **(9+6+5+4+3+10+8+7+8+9) / 10 = 6,9** — nota: o NPS convencional seria −10 (3 promotores, 4 detratores em 10 respostas), mas o KPI exibido no painel é a média aritmética das notas.

### `produtos` (10 registros)

| id | nome | categoria | preco_base | ativo |
|---|---|---|---|---|
| 1 | CRM Básico (por usuário/mês) | Software | 1200.00 | true |
| 2 | CRM Enterprise (por usuário/mês) | Software | 3500.00 | true |
| 3 | Módulo Analytics | Software | 800.00 | true |
| 4 | Consultoria de Implantação (por dia) | Consultoria | 2500.00 | true |
| 5 | Suporte Técnico Anual | Serviço | 1800.00 | true |
| 6 | Servidor Dell PowerEdge R350 | Hardware | 4500.00 | true |
| 7 | Licença Office 365 (por usuário/mês) | Software | 45.00 | true |
| 8 | Treinamento (por turma) | Treinamento | 1200.00 | true |
| 9 | Integração API ERP | Serviço | 3200.00 | true |
| 10 | Backup Cloud 1 TB (mensal) | Serviço | 300.00 | true |

### `itens_pedido` (30 registros — valores somam exatamente o `valor_total` de cada pedido)

| id | pedido_id | produto_id | quantidade | preco_unitario |
|---|---|---|---|---|
| 1 | 1 | 2 | 1 | 3500.00 |
| 2 | 1 | 4 | 2 | 2500.00 |
| 3 | 2 | 1 | 2 | 1200.00 |
| 4 | 2 | 8 | 1 | 1200.00 |
| 5 | 2 | 10 | 2 | 300.00 |
| 6 | 3 | 3 | 2 | 800.00 |
| 7 | 3 | 10 | 1 | 250.00 |
| 8 | 4 | 6 | 2 | 4500.00 |
| 9 | 4 | 4 | 1 | 2500.00 |
| 10 | 4 | 3 | 1 | 500.00 |
| 11 | 5 | 1 | 1 | 1200.00 |
| 12 | 5 | 5 | 1 | 1800.00 |
| 13 | 5 | 10 | 1 | 300.00 |
| 14 | 6 | 9 | 1 | 3200.00 |
| 15 | 6 | 4 | 1 | 2400.00 |
| 16 | 7 | 2 | 1 | 3500.00 |
| 17 | 7 | 4 | 2 | 2500.00 |
| 18 | 7 | 10 | 2 | 350.00 |
| 19 | 8 | 1 | 1 | 1200.00 |
| 20 | 8 | 8 | 1 | 900.00 |
| 21 | 9 | 6 | 2 | 4500.00 |
| 22 | 9 | 2 | 1 | 3500.00 |
| 23 | 9 | 4 | 1 | 2500.00 |
| 24 | 10 | 9 | 1 | 3200.00 |
| 25 | 10 | 5 | 1 | 1800.00 |
| 26 | 10 | 3 | 2 | 900.00 |
| 27 | 11 | 2 | 1 | 3500.00 |
| 28 | 11 | 3 | 1 | 1000.00 |
| 29 | 12 | 1 | 2 | 1200.00 |
| 30 | 12 | 10 | 1 | 800.00 |

### `oportunidades` (20 registros — distribuição dispara anomalia A-04)

| id | cliente_id | etapa | valor_estimado | data_abertura | data_fechamento_prev | responsavel |
|---|---|---|---|---|---|---|
| 1 | 1 | prospeccao | 15000.00 | 2024-08-15 | 2024-12-15 | Carlos Andrade |
| 2 | 4 | prospeccao | 22000.00 | 2024-09-01 | 2024-12-01 | Marina Costa |
| 3 | 5 | prospeccao | 8000.00 | 2024-09-10 | 2024-12-10 | Carlos Andrade |
| 4 | 8 | prospeccao | 12000.00 | 2024-10-01 | 2025-01-15 | Rodrigo Silva |
| 5 | 10 | prospeccao | 18000.00 | 2024-10-15 | 2025-02-01 | Marina Costa |
| 6 | 7 | prospeccao | 5000.00 | 2024-10-20 | 2025-01-20 | Rodrigo Silva |
| 7 | 1 | proposta | 15000.00 | 2024-07-01 | 2024-11-30 | Carlos Andrade |
| 8 | 2 | proposta | 28000.00 | 2024-07-15 | 2024-11-15 | Marina Costa |
| 9 | 3 | proposta | 9500.00 | 2024-07-20 | 2024-11-20 | Carlos Andrade |
| 10 | 4 | proposta | 35000.00 | 2024-08-01 | 2024-11-30 | Rodrigo Silva |
| 11 | 5 | proposta | 12000.00 | 2024-08-10 | 2024-11-28 | Marina Costa |
| 12 | 6 | proposta | 18500.00 | 2024-08-20 | 2024-12-01 | Carlos Andrade |
| 13 | 9 | proposta | 42000.00 | 2024-09-05 | 2024-12-15 | Rodrigo Silva |
| 14 | 10 | proposta | 15000.00 | 2024-09-15 | 2024-12-20 | Marina Costa |
| 15 | 8 | proposta | 8000.00 | 2024-09-25 | 2024-11-30 | Carlos Andrade |
| 16 | 4 | negociacao | 32000.00 | 2024-06-01 | 2024-11-10 | Rodrigo Silva |
| 17 | 9 | negociacao | 40000.00 | 2024-06-15 | 2024-11-15 | Marina Costa |
| 18 | 1 | fechado_ganho | 15000.00 | 2024-05-01 | 2024-09-30 | Carlos Andrade |
| 19 | 5 | fechado_perdido | 9000.00 | 2024-06-01 | 2024-10-31 | Carlos Andrade |
| 20 | 7 | fechado_perdido | 5500.00 | 2024-07-01 | 2024-10-15 | Rodrigo Silva |

> Distribuição: prospeccao=6 · proposta=9 · negociacao=2 · fechado_ganho=1 · fechado_perdido=2
> Proporção de estoque Proposta→Negociação: 2/9 = **22%** (abaixo dos 30% de meta → dispara I-03)

### `audit_log` (12 registros — rastreia o ciclo completo de dois clientes em risco)

| id | tabela | operacao | registro_id | usuario | timestamp | dados_anteriores |
|---|---|---|---|---|---|---|
| 1 | clientes | INSERT | 2 | ana.lima | 2023-01-22 09:14:33 | null |
| 2 | pedidos | INSERT | 2 | carlos.andrade | 2024-07-10 14:22:07 | null |
| 3 | pedidos | UPDATE | 2 | ana.lima | 2024-07-21 10:05:18 | `{"status":"pendente"}` |
| 4 | pedidos | UPDATE | 2 | sistema | 2024-08-08 16:41:52 | `{"status":"aprovado","data_entrega_real":null}` |
| 5 | avaliacoes_nps | INSERT | 2 | sistema | 2024-08-10 09:03:44 | null |
| 6 | avaliacoes_nps | INSERT | 3 | sistema | 2024-08-25 11:17:29 | null |
| 7 | avaliacoes_nps | INSERT | 4 | sistema | 2024-09-05 14:38:51 | null |
| 8 | avaliacoes_nps | INSERT | 5 | sistema | 2024-10-01 08:55:12 | null |
| 9 | clientes | UPDATE | 3 | sistema | 2024-10-01 08:55:15 | `{"status":"ativo"}` |
| 10 | clientes | UPDATE | 2 | sistema | 2024-10-05 07:00:01 | `{"status":"ativo"}` |
| 11 | oportunidades | UPDATE | 16 | rodrigo.silva | 2024-10-15 15:22:44 | `{"etapa":"proposta"}` |
| 12 | pedidos | UPDATE | 9 | ana.lima | 2024-10-11 16:44:07 | `{"status":"pendente"}` |

> **Leitura da narrativa:** registros 2–4 mostram o ciclo de vida do pedido 2 (Beta Distribuidora: criação → aprovação → entrega com atraso). Registros 6–9 mostram as 3 avaliações NPS de Gama Serviços chegando e o sistema atualizando o status para `em_risco` automaticamente 3 segundos após o INSERT da nota 3 (id=8 às 08:55:12 → id=9 às 08:55:15). Registro 11 mostra Rodrigo Silva avançando oportunidade de Delta Indústria de `proposta` para `negociacao`.

---

## 2.5 Anomalias Intencionais

| # | Tabela | Registro(s) | Anomalia | Insight disparado |
|---|---|---|---|---|
| A-01 | `pedidos` | IDs 2 e 3 | `data_entrega_real` ultrapassa `data_entrega_prev` em 15+ dias | Pedido com atraso crítico → NPS em risco |
| A-02 | `clientes` | IDs 2 e 3 | Último pedido há 118 e 100 dias respectivamente | Risco de churn → oferta de reativação |
| A-03 | `avaliacoes_nps` | IDs 3, 4 e 5 (cliente 3) | 3 notas consecutivas ≤ 6 para Gama Serviços | Cliente detrator → acionar CS imediatamente |
| A-04 | `oportunidades` | IDs 7–15 vs 16–17 | 9 registros em "proposta", apenas 2 em "negociacao" → proporção de estoque de 22% | Gargalo no funil → revisar abordagem na etapa de proposta |

---

## 2.6 Batch Sync Diário — ERP → NexusVendas

O NexusVendas é um módulo de inteligência implantado sobre o ERP corporativo. Os dados transacionais **originam-se no ERP** e são copiados diariamente para o RDS do NexusVendas pelo **SyncJob** (Node.js), disparado pelo **EventBridge Scheduler** às 02h00.

### Origem dos dados por tabela

| Tabela | Fonte | Defasagem máx. | Observação |
|---|---|---|---|
| `clientes` | ERP (fonte primária) | 24 horas | Cadastro de empresas clientes |
| `pedidos` | ERP (fonte primária) | 24 horas | Transações de venda |
| `itens_pedido` | ERP (fonte primária) | 24 horas | Itens de cada pedido |
| `produtos` | ERP (fonte primária) | 24 horas | Catálogo de produtos |
| `avaliacoes_nps` | ERP (fonte primária) | 24 horas | Pesquisas de satisfação pós-venda |
| `oportunidades` | NexusVendas (nativo) | Tempo real | Criadas e gerenciadas pelo módulo CRM |
| `audit_log` | NexusVendas (nativo) | Tempo real | Gerado pelos controllers a cada operação de usuário **e** pela Lambda SyncJob (com `usuario='syncjob'`) a cada execução do batch |

### Idempotência via `erp_id`

Cada tabela sincronizada possui o campo `erp_id VARCHAR(50) UNIQUE` com o identificador do registro no ERP. O SyncJob executa `UPSERT ON CONFLICT` para evitar duplicatas em execuções consecutivas:

```sql
INSERT INTO pedidos (cliente_id, data_pedido, data_entrega_real, valor_total, status, erp_id)
VALUES (:cliente_id, :data_pedido, :data_entrega_real, :valor_total, :status, :erp_id)
ON CONFLICT (erp_id) DO UPDATE SET
  status            = EXCLUDED.status,
  data_entrega_real = EXCLUDED.data_entrega_real;
```

### Problema de onboarding e fallback NULL

Quando a empresa contrata o módulo, a tabela `pedidos` pode estar **vazia** no primeiro dia (sync ainda não rodou). Sem proteção, a regra I-01 retornaria todos os clientes como "em risco" — falso positivo em massa.

A regra usa `data_cadastro` como fallback quando não há pedidos:

```
ref = ultimoPedido ?? data_cadastro
diasSemCompra = diasDesde(ref)
```

Um cliente cadastrado há 30 dias, mas sem pedidos ainda por causa do onboarding, não será erroneamente alertado como inativo há 30 dias.

### Gatilho e execução

| Componente | Detalhe |
|---|---|
| **EventBridge Scheduler** | Cron `0 2 * * *` — dispara às 02h00 diariamente; invoca uma **Lambda SyncJob** dedicada (EventBridge não consegue invocar uma instância EC2/Beanstalk diretamente) |
| **Lambda SyncJob** | Node.js (função Lambda separada do Beanstalk) — conecta à API REST ou read replica do ERP, executa os UPSERTs no RDS e registra a execução no `audit_log` com `usuario='syncjob'` |
| **Fonte** | API REST ou read replica do banco ERP corporativo |
| **Log** | Cada execução registra registros inseridos/atualizados no CloudWatch Logs; erros de sync disparam CloudWatch Alarm |
