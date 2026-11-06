# Gabarito — Respostas da Banca Avaliadora NexusVendas

> **Uso interno:** Respostas esperadas para orientar a avaliação. Respostas dos candidatos não precisam ser idênticas — avaliar coerência técnica e capacidade de argumentação.

---

## Bloco 1 — Visão do Produto e Engenharia de Requisitos

---

**Q1 — Heurística determinística vs. modelo preditivo de ML**

Uma **regra determinística** aplica um limiar fixo definido por especialistas de domínio: se `dias_sem_compra >= 90`, o cliente está em risco. O resultado é binário, auditável e previsível — dado o mesmo input, o output é sempre o mesmo.

Um **modelo preditivo de ML** aprende padrões multivariados a partir de dados históricos: frequência de compra, sazonalidade, ticket médio, variações de NPS, segmento, etc. O modelo produz uma probabilidade de churn, não uma classificação binária.

**Quando a heurística é suficiente:** Base de clientes pequena (< 500), dados históricos escassos, equipe sem expertise em ML, produto em fase de MVP onde a regra captura os casos mais óbvios com boa precisão.

**Quando é inadequada:** Base grande com comportamentos heterogêneos (um cliente do agronegócio que compra sazonalmente a cada 180 dias não está em risco, mas seria flagrado pela regra). O modelo de ML consegue aprender que sazonalidade é normal para aquele segmento.

---

**Q2 — Threshold hardcoded R$3.000**

**Riscos:** Qualquer alteração exige modificação de código, commit, CI/CD e redeployment — risco de bug em produção para uma mudança de regra de negócio. Além disso, o valor pode se tornar defasado pela inflação ou mudança de estratégia comercial sem que o time de negócios perceba que precisa acionar o time de engenharia.

**Refatoração sugerida:**
- Criar uma tabela de configuração no banco: `configuracoes(chave VARCHAR PK, valor TEXT, descricao TEXT)` com um registro `churn_ticket_threshold = 3000`.
- O Service lê esse valor no início da execução: `const threshold = await ConfigRepository.get('churn_ticket_threshold')`.
- Alterações via endpoint `PATCH /admin/config` (role `admin`), sem redeployment.
- Alternativa mais simples: variável de ambiente `CHURN_TICKET_THRESHOLD=3000` lida via `process.env` — sem banco, mas ainda requer restart do processo.

---

**Q3 — Tagline mapeada para funcionalidades**

| Objetivo | Funcionalidade | Persona | Como endereça a dor |
|---|---|---|---|
| **Venda mais** | Funil de oportunidades (F-04) + insight I-03 (gargalo) | Gerente Comercial | Identifica em qual etapa o pipeline está travado e sugere revisão de abordagem antes do fim do mês |
| **Perca menos** | Insight I-01 (churn risk) + I-02 (NPS crítico) | Analista de CX | Lista clientes em risco com ação específica antes que cancelem — substitui a detecção reativa por proativa |
| **Decida melhor** | Dashboard com 4 KPIs consolidados (F-01) | Gerente Comercial | Substitui planilhas dispersas por uma visão unificada de receita, pedidos, risco e satisfação em tempo real |

---

## Bloco 2 — Modelagem de Banco de Dados

---

**Q4 — Snapshot de preço em `itens_pedido`**

O problema que a decisão resolve é a **mutabilidade retroativa de dados financeiros**. Se `itens_pedido` referenciasse `produtos.preco_base` via FK sem snapshot, qualquer atualização de preço do produto alteraria retroativamente o valor calculado de pedidos históricos.

Exemplo concreto: o produto "CRM Enterprise" custava R$3.500 em agosto/2024. Se em janeiro/2025 o preço subir para R$4.200, uma query de receita histórica recalcularia todos os pedidos antigos com o novo preço, distorcendo demonstrativos financeiros, comissões pagas e metas já fechadas.

O snapshot garante **imutabilidade do registro transacional**: o preço capturado é o preço vigente no momento da venda, independente de alterações futuras no catálogo.

---

**Q5 — Query SQL: ticket médio por cliente**

```sql
SELECT
    c.id,
    c.nome,
    AVG(p.valor_total) AS ticket_medio,
    COUNT(p.id)        AS total_pedidos_entregues
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
WHERE p.status = 'entregue'
GROUP BY c.id, c.nome
HAVING COUNT(p.id) > 1
ORDER BY ticket_medio DESC;
```

**Explicação:** O `HAVING COUNT > 1` garante que apenas clientes com mais de um pedido entregue entram no resultado. O `AVG` calcula a média dos valores dos pedidos filtrados. O `ORDER BY ticket_medio DESC` ordena do maior para o menor.

---

**Q6 — Novo insight para atrasos de entrega**

**Critério de disparo:** `data_entrega_real > data_entrega_prev AND DATEDIFF(data_entrega_real, data_entrega_prev) >= 7` (atraso de 7 ou mais dias).

**Endpoint sugerido:** `GET /insights/atrasos-entrega`

**Resposta esperada:**
```json
{
  "total": 2,
  "pedidos": [
    {
      "pedido_id": 2,
      "cliente": "Beta Distribuidora S.A.",
      "dias_atraso": 19,
      "valor_total": 4200.00,
      "acao_sugerida": "Contatar cliente para explicar o atraso e oferecer compensação"
    }
  ]
}
```

**Impacto no modelo:** Nenhuma nova tabela necessária. A lógica usa campos já existentes em `pedidos`. Seria necessário adicionar um índice em `pedidos(data_entrega_prev, data_entrega_real)` para performance.

**Conexão com NPS:** O insight pode ser cruzado com `avaliacoes_nps` para identificar se pedidos atrasados geraram avaliações baixas — validando empiricamente a correlação A-01 → A-03.

---

**Q7 — Auditoria por trigger vs. auditoria na camada de serviço**

| Critério | Trigger no banco | Auditoria no Service |
|---|---|---|
| **Consistência** | Alta — captura toda operação, mesmo acessos diretos ao banco via DBA ou scripts de migração | Média — só captura operações que passam pela API |
| **Manutenibilidade** | Baixa — lógica dispersa em DDL, difícil de testar, acoplada ao banco | Alta — código centralizado, testável com mocks |
| **Performance** | Impacto em toda operação DML, mesmo as internas | Overhead apenas nas operações via API |
| **Portabilidade** | Sintaxe de trigger varia entre SGBDs (PostgreSQL, MySQL, SQLite) | Independente de banco |

**Conclusão esperada:** Para o NexusVendas, a auditoria na camada de serviço é mais adequada no MVP por ser mais testável e manutenível. Em um ambiente com acesso direto ao banco por múltiplas aplicações ou times de dados, triggers seriam necessários para garantir cobertura total.

---

**Q8 — `pedido_id` nullable em `avaliacoes_nps`**

**Justificativa de negócio:** Uma empresa cliente pode responder uma pesquisa periódica de satisfação (NPS relacional) que não está vinculada a uma transação específica — avalia o relacionamento geral com o fornecedor. Isso é diferente do NPS transacional, disparado após uma entrega. O modelo suporta ambos os tipos.

**Exemplo concreto nos dados:** Avaliações 4 e 5 do cliente Gama Serviços (IDs 4 e 5 em `avaliacoes_nps`) têm `pedido_id = null` — são avaliações espontâneas de relacionamento, não de pedidos específicos.

**Restrição de integridade:** A FK `pedido_id → pedidos.id` com `ON DELETE SET NULL` garante que, quando preenchido, o valor referencia um pedido válido. O banco rejeita automaticamente um `pedido_id` inexistente.

---

## Bloco 3 — Design de API REST

---

**Q9 — PUT vs. PATCH e problema de concorrência**

**PUT** é idempotente e substitui o recurso inteiro: o cliente envia a representação completa e o servidor a sobrescreve. Se enviar apenas o campo `status`, todos os outros campos do pedido seriam apagados ou sobrescritos com null.

**PATCH** atualiza parcialmente o recurso — apenas os campos enviados são modificados. É semanticamente correto para "alterar só o status" sem precisar conhecer ou re-enviar todos os campos do pedido.

**Problema de concorrência (race condition):** Dois usuários leem o pedido com `status = pendente` simultaneamente. Ambos enviam `PATCH` — um para `aprovado`, outro para `cancelado`. Dependendo da ordem de chegada, um sobrescreve o outro sem saber que o estado mudou entre a leitura e a escrita.

**Mitigação:** Otimistic locking com campo `versao INT` no pedido. O PATCH inclui a versão atual: `PATCH /pedidos/7/status { "status": "aprovado", "versao": 3 }`. O banco executa `UPDATE pedidos SET status='aprovado', versao=4 WHERE id=7 AND versao=3` — se retornar 0 linhas afetadas, a API responde 409 Conflict.

---

**Q10 — Vulnerabilidade de validação: `?dias=0`**

**Vulnerabilidade:** O parâmetro `dias` não é validado. Com `dias=0`, a condição `diasSemCompra >= 0` é verdadeira para todos os clientes, incluindo os que compraram hoje — produzindo um falso positivo massivo e potencialmente expondo dados de todos os clientes a um usuário sem permissão de visão global.

**Correção no Controller:**

```javascript
const dias = parseInt(req.query.dias) || 90;

if (isNaN(dias) || dias < 1 || dias > 3650) {
  return res.status(400).json({
    error: {
      code: "PARAMETRO_INVALIDO",
      message: "O parâmetro 'dias' deve ser um número inteiro entre 1 e 3650.",
      status: 400
    }
  });
}
```

Código HTTP: **400 Bad Request**, no padrão de erro definido em `parte3-api.md §3.2`.

---

**Q11 — Limitação temporal da regra NPS**

**Problema identificado:** A regra busca as últimas 3 avaliações sem filtro de data. Se um cliente teve notas 5, 4, 3 há dois anos e desde então não avaliou mais, o sistema dispara o alerta indefinidamente — mesmo que o cliente tenha sido recuperado e nunca mais respondeu uma pesquisa.

**Correção proposta na pseudológica:**

```
avaliacoes = buscarAvaliacoes(cliente.id, ORDEM: data DESC, LIMITE: 3)

SE avaliacoes.length == 3:
  SE avaliacoes[0].data_avaliacao >= HOJE - 180 dias:  // avaliação mais recente < 6 meses
    SE TODAS as avaliacoes.nota <= 6:
      ADICIONAR alerta
```

O critério `data_avaliacao >= HOJE - 180 dias` garante que o alerta só é disparado se a avaliação mais recente for relativamente atual. O período de 180 dias é configurável (mesma recomendação da Q2 para evitar hardcode).

---

**Q12 — Trade-off JWT: duração do token e armazenamento**

**Tokens curtos (1h):** Menor janela de exploração em caso de roubo — um token interceptado expira rapidamente. Porém exige que o cliente faça refresh frequentemente, aumentando tráfego e complexidade.

**Refresh token longo (7 dias):** Permite re-emissão silenciosa do access token sem re-login. O risco é que, se o refresh token for comprometido, o atacante pode emitir novos access tokens por até 7 dias. Por isso deve ser tratado como credencial e armazenado de forma mais segura.

**Por que não usar localStorage:** O localStorage é acessível via JavaScript — qualquer script XSS rodando na página pode ler e exfiltrar o token. Isso é especialmente crítico para o refresh token de longa duração.

**Armazenamento recomendado:** Cookie `HttpOnly; Secure; SameSite=Strict`. Cookies com flag `HttpOnly` são inacessíveis via JavaScript, eliminando a superfície de ataque XSS. A flag `Secure` garante transmissão apenas via HTTPS. `SameSite=Strict` mitiga CSRF.

---

## Bloco 4 — Arquitetura de Software

---

**Q13 — Separação de camadas viabilizando testes unitários**

Com a lógica de negócio isolada na camada **Service**, o teste unitário de `calcularChurnRisk` pode ser escrito sem instanciar banco, conexão HTTP ou framework Express:

```javascript
// Teste unitário — sem banco real
const mockRepository = {
  getClientesSemPedido: jest.fn().mockResolvedValue([
    { id: 2, nome: "Beta Distribuidora", ultimo_pedido: "2024-07-10" }
  ]),
  getTicketMedio: jest.fn().mockResolvedValue(4200.00)
};

const service = new InsightService(mockRepository); // injeção de dependência
const resultado = await service.calcularChurnRisk(90);

expect(resultado[0].acao_sugerida).toBe("Enviar oferta de reativação com 10% de desconto");
```

**Dependências eliminadas:** conexão PostgreSQL, dados de fixture no banco, lentidão de I/O. O teste roda em milissegundos e é determinístico.

**Pré-requisito:** O Service deve receber o Repository por injeção de dependência (construtor ou parâmetro), não instanciá-lo internamente — caso contrário a separação de camadas não é suficiente para desacoplar o teste.

---

**Q14 — Responsabilidades do API Gateway**

Três responsabilidades que hoje estão distribuídas e o API Gateway centralizaria:

1. **Rate limiting:** Hoje cada instância da API Node.js controlaria requisições individualmente. Com API Gateway, um vendedor não pode disparar 1.000 chamadas a `/insights/churn-risk` por minuto — o Gateway rejeita com 429 Too Many Requests antes de sequer chegar à aplicação.

2. **Autenticação centralizada:** Hoje o middleware JWT está replicado em todas as rotas Express. O Gateway valida o token e injeta os claims do usuário no header antes de rotear — os microsserviços de Vendas, Insights e Notificações não precisam implementar auth individualmente.

3. **Roteamento e versionamento:** Hoje `/clientes`, `/pedidos` e `/insights` estão no mesmo processo Node.js. Com Gateway, `/v1/insights/*` pode ser roteado para a função Lambda de Insights enquanto `/v1/pedidos/*` vai para a API de Vendas no ECS/Fargate — sem que o frontend mude a URL base.

---

**Q15 — Arquitetura síncrona vs. assíncrona com fila SQS**

**Síncrona (atual):**
- Usuário clica em "Dashboard" → React dispara `GET /insights/churn-risk` → API executa a query → retorna JSON → tela renderiza.
- Latência percebida: igual ao tempo de execução da query (tipicamente < 500ms com dados de MVP, podendo chegar a 5-10s com 100k clientes).
- Adequada quando: dados precisam ser sempre frescos, base pequena, resposta imediata é esperada.

**Assíncrona com SQS + Lambda:**
- Um job periódico (EventBridge Scheduler a cada 5 min) publica uma mensagem na fila SQS.
- Lambda consome a mensagem, executa o cálculo de churn e persiste o resultado em uma tabela `insights_cache`.
- O endpoint `GET /insights/churn-risk` simplesmente lê da tabela cache — tempo de resposta < 50ms, sem tocar nas tabelas de pedidos.
- Latência percebida: praticamente zero, mas dados podem ter até 5 minutos de defasagem.
- Adequada quando: cálculo é caro, dados não precisam ser em tempo real, escalabilidade é prioridade.

**Como o frontend saberia que o resultado está pronto:**
- Polling: React consulta `GET /insights/status` a cada N segundos até receber `{ ready: true }`.
- WebSocket: API notifica o cliente quando o cálculo termina.
- Server-Sent Events (SSE): solução mais simples para notificações unidirecionais servidor → cliente.

---

## Bloco 5 — Identidade Visual e UX

---

**Q16 — Variações percentuais sem contexto temporal**

**Problema:** "↑ +12%" é ambíguo — 12% em relação a quê? Ao mês anterior? À mesma semana do ano passado? À meta? Sem esse contexto, o número pode induzir decisões erradas: um gerente pode comemorar +12% sem saber que a meta era +25%.

**Solução sem aumentar carga cognitiva:**
- Adicionar um tooltip ao passar o mouse sobre a variação: "vs. setembro/2024 (R$14.100)".
- Exibir o período de referência como microtexto abaixo do KPI: "vs. mês anterior".
- Usar um seletor de período global no topo do dashboard (ex: "Outubro 2024 | Mês atual") que contextualize todos os KPIs simultaneamente — uma única escolha do usuário resolve o contexto de todos os cards.

A terceira opção é a mais eficiente em termos de densidade de informação: um controle, múltiplos KPIs contextualizados.

---

**Q17 — Acessibilidade WCAG 2.1 e daltonismo**

**Contraste mínimo WCAG 2.1:**
- Nível AA: razão de contraste ≥ 4.5:1 para texto normal, ≥ 3:1 para texto grande (≥ 18px bold ou ≥ 24px regular).
- O âmbar `#F59E0B` sobre fundo branco `#F8FAFC` tem contraste de aproximadamente 2.8:1 — **abaixo do mínimo AA** para texto normal. Texto escuro `#1E293B` sobre o badge âmbar teria contraste de ~5.2:1, aprovado.

**Para daltonismo vermelho-verde (deuteranopia):**
- Nunca comunicar estado apenas por cor — um badge "em risco" que é só âmbar e um badge "ativo" que é só verde parecem idênticos para um usuário com deuteranopia.
- Soluções: (a) adicionar ícone ao badge (⚠ para risco, ✓ para ativo); (b) usar labels de texto dentro do badge além da cor; (c) usar padrões de textura ou borda diferente como segundo canal visual.

---

## Bloco 6 — Escalabilidade, Segurança e LGPD

---

**Q18 — Índice composto: ordem das colunas**

**Conceito:** Um índice composto em `(cliente_id, data_pedido)` cria uma estrutura B-tree ordenada primeiro por `cliente_id`, depois por `data_pedido` dentro de cada cliente. A regra geral é: **colunas de igualdade primeiro, colunas de range/ordenação depois**.

**Ordem correta:** `(cliente_id, data_pedido DESC)` — porque a query filtra por `cliente_id = X` (igualdade) e depois ordena por `data_pedido DESC` para pegar o mais recente.

**Análise da query de churn:**
```sql
SELECT * FROM pedidos
WHERE cliente_id = 2
ORDER BY data_pedido DESC
LIMIT 1;
```
Com o índice `(cliente_id, data_pedido)`, o plano de execução faria um **Index Scan** direto nas entradas de `cliente_id = 2`, já ordenadas por data — retornando o primeiro registro sem full table scan. Sem o índice, um **Seq Scan** percorreria todos os 100k+ registros.

**Ordem invertida seria ineficiente:** Um índice em `(data_pedido, cliente_id)` não ajuda quando o filtro principal é por `cliente_id`, pois a primeira coluna do índice (`data_pedido`) não está sendo filtrada com igualdade.

---

**Q19 — LGPD aplicada aos campos `responsavel` e `usuario`**

**O problema:** Nomes de funcionários ("Carlos Andrade", "Marina Costa") em `oportunidades.responsavel` e `audit_log.usuario` são **dados pessoais** segundo o Art. 5º da LGPD — identificam diretamente uma pessoa física.

**Obrigações LGPD:**
- Definir base legal para o tratamento (legítimo interesse da empresa ou execução de contrato de trabalho).
- Garantir direito de acesso, correção e anonimização ao titular (o funcionário).
- Não reter dados além do necessário — `audit_log` crescendo indefinidamente viola o princípio da necessidade.

**Medidas técnicas propostas:**
1. **Substituir nome livre por FK para tabela `usuarios`:** `responsavel VARCHAR(100)` → `responsavel_id INT FK → usuarios.id`. O nome fica em um único lugar, pode ser anonimizado ou excluído via cascade controlado, e a auditoria mantém apenas o ID.
2. **Política de retenção e anonimização do `audit_log`:** Após 2 anos, executar `UPDATE audit_log SET usuario = 'anonimizado' WHERE timestamp < NOW() - INTERVAL '2 years'`, preservando o log de operação sem reter o dado pessoal além do necessário.

---

**Q20 — Serverless (Lambda + DynamoDB) vs. arquitetura atual**

**(a) Adequação ao modelo relacional:**
O NexusVendas é fortemente relacional: 7 tabelas com FKs, JOINs complexos nos insights (churn cruza `clientes` + `pedidos`; NPS cruza `avaliacoes_nps` + `clientes`). DynamoDB é um banco NoSQL orientado a acesso por chave — JOINs multi-tabela exigiriam desnormalização agressiva ou múltiplas chamadas na aplicação, aumentando complexidade e custo de manutenção. PostgreSQL no RDS é a escolha natural.

**(b) Cold start e latência:**
Lambda tem cold start de 200ms–1s em Node.js para a primeira invocação após período inativo. Para um dashboard que o gerente abre toda manhã, o primeiro acesso seria visivelmente mais lento. Com Elastic Beanstalk (processo contínuo), não há cold start — a API está sempre aquecida.

**(c) Curva de aprendizado:**
Node.js + Express é o stack declarado no projeto — a equipe já tem familiaridade. Migrar para Lambda exigiria aprender SAM/CDK para infraestrutura, modelo de execução stateless de funções, limites de timeout (15 min) e gerenciamento de conexões de banco por invocação (problema clássico de Lambda com RDS).

**Recomendação para MVP:** Elastic Beanstalk + RDS PostgreSQL conforme projetado. A arquitetura serverless é válida para o longo prazo quando os microsserviços já estiverem desacoplados e os padrões de acesso forem bem conhecidos.

---

**Q21 — Pontos de inconsistência de dados e mitigações**

**Ponto 1 — `valor_total` em `pedidos` vs. soma de `itens_pedido`:**
O campo `valor_total` pode ser inserido manualmente na API sem validar se bate com `SUM(quantidade * preco_unitario)` dos itens. Um pedido com `valor_total = 10.000` mas itens que somam `8.500` produziria KPIs de receita incorretos no dashboard.

*Mitigação:* Na camada Service, antes de persistir o pedido, calcular `valorCalculado = SUM(itens.quantidade * itens.preco_unitario)` e ou sobrescrever `valor_total` com esse valor, ou rejeitar com 400 se divergir.

**Ponto 2 — Status do cliente (`em_risco`) não sincronizado com a regra de churn:**
Um cliente pode ter `status = ativo` no cadastro mas ser retornado pelo insight I-01 como em risco (sem compra há 90+ dias). A tela de clientes mostraria "ativo" enquanto o dashboard mostraria alerta — contradição visível ao usuário.

*Mitigação:* Job diário (CRON via EventBridge) que executa a regra de churn e atualiza `clientes.status = 'em_risco'` para os clientes que atendem o critério, registrando a mudança no `audit_log`.

---

## Bloco 7 — Questão Integradora

---

**Q22 — NexusVendas é um CRM ou um sistema de relatórios com alertas?**

**Definição de CRM segundo a literatura (Buttle & Maklan, 2015; Peppers & Rogers):**
Um CRM (Customer Relationship Management) é um sistema que gerencia o ciclo de vida completo do relacionamento com o cliente: captação, engajamento, retenção e recuperação. Operacionalmente, envolve três capacidades: (1) **CRM operacional** — automação de força de vendas (SFA), automação de marketing e suporte; (2) **CRM analítico** — análise de dados para segmentação e predição; (3) **CRM colaborativo** — integração multicanal para comunicação com o cliente.

**Onde o NexusVendas se enquadra:**
- CRM analítico: sim — os três insights (churn, NPS, funil) são análise de dados para apoio à decisão.
- CRM operacional parcial: gestão de pedidos e oportunidades são funcionalidades SFA básicas. Porém não há automação de marketing, disparo de e-mails ou gestão de interações (ligações, e-mails) — itens explicitamente no backlog futuro.
- CRM colaborativo: ausente — não há integração com canais de comunicação.

**Defesa técnica:**
A crítica tem mérito parcial. O NexusVendas é um **CRM operacional mínimo com camada analítica**, não um CRM completo. A diferença de um sistema de relatórios puro é que o NexusVendas possui: (a) dados transacionais proprietários (pedidos, oportunidades) — não apenas importação de dados externos; (b) ações sugeridas vinculadas aos alertas — não apenas visualização; (c) CRUD de clientes e oportunidades que fecha o ciclo operacional básico.

**Conclusão honesta:** O produto está no espectro de um CRM leve (lightweight CRM), equivalente a ferramentas como Pipedrive ou HubSpot Starter — distintos de sistemas como Salesforce ou SAP Sales Cloud que têm automação completa. Para médias empresas sem CRM, isso representa valor real. Apresentá-lo como "inspirado no SAP Sales Cloud" é defensável enquanto analogia de posicionamento de mercado, não como equivalência funcional.
