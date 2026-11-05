# Parte 3 — Planejamento da API

## Status: [x] Concluída

---

## 3.1 Autenticação

**Padrão:** JWT (Bearer Token)

```http
POST /auth/login
Content-Type: application/json

{ "email": "gerente@nexusvendas.com", "senha": "senha123" }

→ 200 OK
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", "expiresIn": 3600 }
```

Todas as demais rotas exigem o header:
```
Authorization: Bearer <token>
```

**Roles disponíveis:** `admin` | `gerente` | `vendedor`

---

## 3.2 Padrão de Erros

```json
{
  "error": {
    "code": "CLIENTE_NAO_ENCONTRADO",
    "message": "Cliente com id 99 não existe.",
    "status": 404
  }
}
```

| Código HTTP | Quando usar |
|---|---|
| 200 | Sucesso com dados retornados |
| 201 | Recurso criado com sucesso |
| 400 | Dados inválidos ou campo obrigatório ausente |
| 401 | Token ausente ou expirado |
| 403 | Usuário não tem permissão para esta ação |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## 3.3 Endpoints

### Autenticação

| # | Método | Rota | Descrição |
|---|---|---|---|
| 0 | POST | `/auth/login` | Autentica usuário e retorna JWT |

### Clientes

| # | Método | Rota | Descrição |
|---|---|---|---|
| 1 | GET | `/clientes` | Lista todos os clientes (filtros: status, segmento) |
| 2 | GET | `/clientes/:id` | Detalha um cliente com histórico resumido |
| 3 | POST | `/clientes` | Cria novo cliente |
| 4 | PATCH | `/clientes/:id` | Atualiza dados ou status do cliente |

### Pedidos

| # | Método | Rota | Descrição |
|---|---|---|---|
| 5 | GET | `/pedidos` | Lista pedidos (filtros: status, cliente_id, data) |
| 6 | POST | `/pedidos` | Cria novo pedido com itens |
| 7 | PATCH | `/pedidos/:id/status` | Atualiza status do pedido |

### Insights

| # | Método | Rota | Descrição |
|---|---|---|---|
| 8 | GET | `/insights/churn-risk` | Clientes sem pedido há ≥ N dias (default: 90) |
| 9 | GET | `/insights/nps-alertas` | Clientes com 3+ avaliações consecutivas ≤ 6 |
| 10 | GET | `/insights/pipeline` | Análise do funil com taxa de conversão por etapa |

---

## 3.4 Exemplos Completos de Requisição e Resposta

### POST /clientes

**Requisição:**
```http
POST /clientes
Content-Type: application/json
Authorization: Bearer eyJhbGc...

{
  "nome": "Omega Varejo Ltda",
  "segmento": "Varejo",
  "cidade": "Manaus",
  "status": "ativo"
}
```

**Resposta 201:**
```json
{
  "id": 11,
  "nome": "Omega Varejo Ltda",
  "segmento": "Varejo",
  "cidade": "Manaus",
  "data_cadastro": "2024-11-05",
  "status": "ativo"
}
```

**Resposta 400:**
```json
{
  "error": {
    "code": "CAMPO_OBRIGATORIO",
    "message": "O campo 'nome' é obrigatório.",
    "status": 400
  }
}
```

---

### GET /insights/churn-risk?dias=90

**Requisição:**
```http
GET /insights/churn-risk?dias=90
Authorization: Bearer eyJhbGc...
```

**Resposta 200:**
```json
{
  "total": 2,
  "clientes": [
    {
      "id": 2,
      "nome": "Beta Distribuidora S.A.",
      "ultimo_pedido": "2024-07-10",
      "dias_sem_compra": 118,
      "ticket_medio": 4200.00,
      "acao_sugerida": "Enviar oferta de reativação com 10% de desconto"
    },
    {
      "id": 3,
      "nome": "Gama Serviços Ltda",
      "ultimo_pedido": "2024-07-28",
      "dias_sem_compra": 100,
      "ticket_medio": 1850.00,
      "acao_sugerida": "Agendar ligação de relacionamento"
    }
  ]
}
```

---

### GET /insights/nps-alertas

**Requisição:**
```http
GET /insights/nps-alertas
Authorization: Bearer eyJhbGc...
```

**Resposta 200:**
```json
{
  "total": 1,
  "alertas": [
    {
      "cliente_id": 3,
      "nome": "Gama Serviços Ltda",
      "ultimas_notas": [5, 4, 3],
      "media": 4.0,
      "classificacao": "detrator",
      "acao_sugerida": "Acionar Customer Success imediatamente"
    }
  ]
}
```

---

## 3.5 Regras de Insight (Pseudocódigo)

### Regra I-01: Risco de Churn

```
FUNÇÃO calcularChurnRisk(diasLimite = 90):
  resultado = []
  PARA CADA cliente EM clientes:
    ultimoPedido = buscarUltimoPedido(cliente.id)
    diasSemCompra = diasDesde(ultimoPedido.data_pedido)

    SE ultimoPedido É NULO OU diasSemCompra >= diasLimite:
      ticketMedio = MÉDIA(pedidos.valor_total ONDE cliente_id = cliente.id)

      SE ticketMedio > 3000:
        acao = "Enviar oferta de reativação com 10% de desconto"
      SENÃO:
        acao = "Agendar ligação de relacionamento"

      ADICIONAR { cliente, diasSemCompra, ticketMedio, acao } ao resultado

  RETORNAR resultado ORDENADO POR ticketMedio DESC
```

**O que aconteceu:** Cliente sem compra há N dias
**Por que importa:** Ticket médio representa receita recorrente em risco
**Ação sugerida:** Baseada no valor histórico do cliente

---

### Regra I-02: NPS Crítico

```
FUNÇÃO alertasNPS():
  resultado = []
  PARA CADA cliente EM clientes:
    avaliacoes = buscarAvaliacoes(cliente.id, ORDEM: data DESC, LIMITE: 3)

    SE avaliacoes.length == 3:
      SE TODAS as avaliacoes.nota <= 6:
        media = MÉDIA(avaliacoes.nota)
        ADICIONAR { cliente, ultimas_notas, media, acao: "Acionar CS imediatamente" }

  RETORNAR resultado
```

**O que aconteceu:** 3 avaliações consecutivas com nota ≤ 6
**Por que importa:** Cliente detrator — risco de cancelamento e dano à reputação
**Ação sugerida:** Acionar Customer Success imediatamente

---

### Regra I-03: Gargalo no Funil de Vendas

```
FUNÇÃO analisarFunil():
  etapas = ["prospeccao", "proposta", "negociacao", "fechado_ganho"]
  alertas = []

  PARA i DE 0 ATÉ etapas.length - 2:
    etapa_atual  = etapas[i]
    proxima_etapa = etapas[i + 1]

    total_atual   = CONTAR(oportunidades ONDE etapa = etapa_atual)
    total_proxima = CONTAR(oportunidades ONDE etapa = proxima_etapa)

    SE total_atual > 0:
      taxa = total_proxima / total_atual

      SE taxa < 0.30:
        ADICIONAR {
          de: etapa_atual,
          para: proxima_etapa,
          taxa_conversao: taxa,
          alerta: "Gargalo: conversão de " + etapa_atual + " está em " + (taxa * 100) + "%"
        }

  RETORNAR alertas
```

**O que aconteceu:** Taxa de conversão entre etapas abaixo de 30%
**Por que importa:** Meta de receita do mês em risco
**Ação sugerida:** Revisar abordagem na etapa com menor conversão

---

## 3.6 Plano de Testes das Regras de Insight

Os casos abaixo verificam cada regra de negócio — caminho feliz, bordas e entradas inválidas. Os dados de referência são os registros fictícios de `parte2-banco.md`.

---

### I-01 — `calcularChurnRisk(diasLimite)`

| ID | Cenário | Entrada | Resultado esperado |
|---|---|---|---|
| TC-01 | Cliente inativo há mais de 90 dias com ticket alto | Beta Distribuidora (id=2), `diasLimite=90` | Retornado; `acao = "Enviar oferta de reativação com 10% de desconto"` (ticket R$4.200 > R$3.000) |
| TC-02 | Cliente inativo há mais de 90 dias com ticket baixo | Gama Serviços (id=3), `diasLimite=90` | Retornado; `acao = "Agendar ligação de relacionamento"` (ticket R$1.850 ≤ R$3.000) |
| TC-03 | Cliente com pedido recente | Delta Indústria (id=4), `diasLimite=90` | **Não retornado** — último pedido há menos de 90 dias |
| TC-04 | Limite customizado mais restrito | Qualquer cliente, `diasLimite=30` | Lista maior que com `diasLimite=90` — clientes inativos há 30+ dias incluídos |
| TC-05 | Cliente sem nenhum pedido | Novo cliente cadastrado sem pedidos | Retornado — `ultimoPedido É NULO` cobre esse caso na regra |
| TC-06 | Ordenação por ticket médio DESC | Beta (R$4.200) e Gama (R$1.850) ambos em risco | Beta aparece antes de Gama na lista retornada |

---

### I-02 — `alertasNPS()`

| ID | Cenário | Entrada | Resultado esperado |
|---|---|---|---|
| TC-07 | 3 avaliações consecutivas ≤ 6 | Gama Serviços: notas `[5, 4, 3]` (mais recentes) | Retornado; `classificacao = "detrator"`, `acao = "Acionar Customer Success imediatamente"` |
| TC-08 | Última nota ≥ 7 quebra a sequência | Cliente hipotético: notas `[3, 4, 8]` ordenadas por data DESC → `[8, 3, 4]` | **Não retornado** — nem todas as 3 últimas são ≤ 6 |
| TC-09 | Cliente com menos de 3 avaliações | Cliente com apenas 2 avaliações `[4, 5]` | **Não retornado** — a condição `avaliacoes.length == 3` não é satisfeita |
| TC-10 | Exatamente no limite (nota = 6) | Notas `[6, 6, 6]` | Retornado — a regra é `<= 6`, portanto 6 é incluído |
| TC-11 | Nota 7 no limite superior (não dispara) | Notas `[7, 7, 7]` | **Não retornado** — 7 > 6, não satisfaz a condição |

---

### I-03 — `analisarFunil()`

| ID | Cenário | Entrada | Resultado esperado |
|---|---|---|---|
| TC-12 | Gargalo real na transição Proposta→Negociação | `proposta=9`, `negociacao=2` | Alerta gerado: `de="proposta"`, `para="negociacao"`, `taxa_conversao=0.22`, texto indica 22% |
| TC-13 | Transição saudável (sem gargalo) | `negociacao=2`, `fechado_ganho=1` → taxa 50% | **Sem alerta** — 50% > 30% |
| TC-14 | Etapa com 0 registros não gera divisão por zero | Etapa `prospeccao` zerada | Transição ignorada silenciosamente — `SE total_atual > 0` protege o cálculo |
| TC-15 | Alerta contém todos os campos obrigatórios | Qualquer gargalo detectado | Resposta inclui: `de`, `para`, `taxa_conversao` (número entre 0 e 1) e `alerta` (string descritiva) |

---

### Cobertura dos módulos da formação

| Módulo | Onde aparece neste plano |
|---|---|
| Lógica de programação | Condicionais e laços das regras I-01, I-02 e I-03 testados em TC-01 a TC-15 |
| Testes | Este plano — casos de caminho feliz, bordas e entradas inválidas para cada regra |
| Node.js + Express | Endpoints `GET /insights/*` que executam as funções testadas acima |
