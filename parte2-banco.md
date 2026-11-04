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
| nome | VARCHAR(100) | Sim | Razão social da empresa | — |
| segmento | VARCHAR(50) | Não | Ex: Varejo, Tecnologia, Indústria | — |
| cidade | VARCHAR(80) | Não | Cidade sede | — |
| data_cadastro | DATE | Sim | Data de criação do registro | Default: NOW() |
| status | ENUM | Sim | `ativo` / `inativo` / `em_risco` | Default: ativo |

### Tabela: `pedidos`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| cliente_id | INT (FK) | Sim | Empresa compradora | FK → clientes.id |
| data_pedido | DATE | Sim | Data de criação | Default: NOW() |
| data_entrega_prev | DATE | Não | Previsão de entrega acordada | — |
| data_entrega_real | DATE | Não | Data de entrega efetiva | — |
| valor_total | DECIMAL(10,2) | Sim | Valor total do pedido | > 0 |
| status | ENUM | Sim | `pendente` / `aprovado` / `entregue` / `cancelado` | Default: pendente |

### Tabela: `itens_pedido`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| pedido_id | INT (FK) | Sim | Pedido ao qual pertence | FK → pedidos.id |
| produto_id | INT (FK) | Sim | Produto comprado | FK → produtos.id |
| quantidade | INT | Sim | Quantidade comprada | > 0 |
| preco_unitario | DECIMAL(10,2) | Sim | Preço no momento da venda | Snapshot — não atualiza com o produto |

### Tabela: `produtos`

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
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
| cliente_id | INT (FK) | Sim | Cliente que avaliou | FK → clientes.id |
| pedido_id | INT (FK) | Não | Pedido relacionado à avaliação | FK → pedidos.id |
| nota | INT | Sim | Nota de 0 a 10 | Entre 0 e 10 |
| comentario | TEXT | Não | Feedback livre do cliente | — |
| data_avaliacao | DATE | Sim | Data da resposta | Default: NOW() |

### Tabela: `audit_log` _(obrigatória)_

| Campo | Tipo | Obrigatório | Descrição | Regra |
|---|---|---|---|---|
| id | INT (PK) | Sim | Identificador único | Auto-increment |
| tabela | VARCHAR(50) | Sim | Nome da tabela afetada | — |
| operacao | ENUM | Sim | `INSERT` / `UPDATE` / `DELETE` | — |
| registro_id | INT | Sim | ID do registro afetado | — |
| usuario | VARCHAR(100) | Sim | Usuário que realizou a ação | — |
| timestamp | DATETIME | Sim | Data e hora da operação | Default: NOW() |
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

---

## 2.5 Anomalias Intencionais

| # | Tabela | Registro(s) | Anomalia | Insight disparado |
|---|---|---|---|---|
| A-01 | `pedidos` | IDs 2 e 3 | `data_entrega_real` ultrapassa `data_entrega_prev` em 15+ dias | Pedido com atraso crítico → NPS em risco |
| A-02 | `clientes` | IDs 2 e 3 | Último pedido há 118 e 100 dias respectivamente | Risco de churn → oferta de reativação |
| A-03 | `avaliacoes_nps` | IDs 3, 4 e 5 (cliente 3) | 3 notas consecutivas ≤ 6 para Gama Serviços | Cliente detrator → acionar CS imediatamente |
