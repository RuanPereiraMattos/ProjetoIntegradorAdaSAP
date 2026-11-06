# Respostas para a Banca — NexusVendas
## Guia de resposta rápida para o apresentador

> **Como usar:** Cada resposta está escrita na primeira pessoa do plural ("a gente", "nós implementamos") porque você está defendendo seu projeto. Leia antes da apresentação, não durante. O objetivo é internalizar — não decorar.

---

## Bloco 1 — Visão do Produto

---

### Q1 — Heurística vs. Machine Learning para churn

**Resposta curta (para chegar em ~40 segundos):**

"Uma regra determinística como a nossa — 'sem compra há 90 dias = em risco' — é binária e auditável: dado o mesmo input, sempre dá o mesmo output. Um modelo de ML aprende padrões mais complexos: frequência de compra, sazonalidade, ticket, histórico de NPS.

A nossa heurística é suficiente no MVP porque a base de clientes é pequena e os casos mais críticos são exatamente os mais óbvios. Ela seria inadequada com uma base grande e comportamentos heterogêneos — um cliente do agronegócio que compra uma vez por semestre não está em risco, mas seria flagrado pela regra. O ML está no backlog para quando tivermos dados históricos suficientes para treinar um modelo."

---

### Q2 — Threshold hardcoded R$3.000

**Resposta curta:**

"O risco é que qualquer mudança de regra de negócio exige commit, deploy e risco de regressão em produção. Se o time comercial decidir mudar o threshold para R$2.500, precisa chamar o engenheiro.

A correção que faríamos: criar uma tabela `configuracoes(chave, valor)` no banco com um registro `churn_ticket_threshold = 3000`, e o Service lê esse valor na execução. Alterações via endpoint `PATCH /admin/config` sem redeployment. Uma alternativa mais simples ainda: variável de ambiente `CHURN_TICKET_THRESHOLD=3000` lida via `process.env`."

---

### Q3 — Tagline mapeada para funcionalidades

**Resposta direta:**

| Objetivo | Funcionalidade | Como resolve a dor |
|---|---|---|
| **Venda mais** | Insight I-03: gargalo no funil | Mostra onde o pipeline trava antes de o mês fechar |
| **Perca menos** | Insight I-01 (churn) + I-02 (NPS) | Substitui detecção reativa por proativa — alerta antes do cancelamento |
| **Decida melhor** | Dashboard com 4 KPIs | Substitui planilhas dispersas por visão unificada em tempo real |

---

## Bloco 2 — Banco de Dados

---

### Q4 — Snapshot de preço em `itens_pedido` *(pergunta clássica — saiba bem)*

**Resposta curta:**

"O problema que o snapshot resolve é a **mutabilidade retroativa de dados financeiros**. Se `itens_pedido` referenciasse o preço diretamente da tabela `produtos`, toda vez que o preço fosse atualizado, todos os pedidos históricos seriam recalculados com o novo valor — distorcendo relatórios de receita, comissões já pagas e metas fechadas.

O snapshot garante que o preço registrado é o vigente no momento da venda. O campo `preco_unitario` em `itens_pedido` nunca muda depois de inserido."

---

### Q5 — Query SQL: ticket médio por cliente

```sql
SELECT
    c.id,
    c.nome,
    AVG(p.valor_total) AS ticket_medio,
    COUNT(p.id)        AS total_pedidos
FROM clientes c
JOIN pedidos p ON p.cliente_id = c.id
WHERE p.status = 'entregue'
GROUP BY c.id, c.nome
HAVING COUNT(p.id) > 1
ORDER BY ticket_medio DESC;
```

**Como explicar em voz alta:** "O `HAVING COUNT > 1` filtra clientes com mais de um pedido entregue. O `AVG` calcula a média dos valores. O `ORDER BY DESC` ordena do maior para o menor ticket."

---

### Q6 — Insight para atrasos de entrega

"Adicionaríamos um endpoint `GET /insights/atrasos-entrega`. O critério de disparo seria: `data_entrega_real > data_entrega_prev` com diferença de 7 ou mais dias.

A ação sugerida: contatar o cliente para explicar e oferecer compensação.

O impacto no modelo de dados é zero — os campos já existem em `pedidos`. Só precisaríamos de um índice em `(data_entrega_prev, data_entrega_real)` para performance. E o insight poderia ser cruzado com `avaliacoes_nps` para confirmar se atrasos geram NPS baixo — fechando o ciclo A-01 → A-03."

---

### Q7 — Auditoria por trigger vs. na camada de serviço

"A auditoria por **trigger no banco** captura tudo, inclusive acessos diretos via DBA — alta consistência. Mas é difícil de testar e a sintaxe varia entre bancos.

A auditoria na **camada Service** é mais fácil de testar com mocks, fica em código versionado e é independente do banco. A desvantagem é que só captura operações que passam pela API.

Para o NexusVendas, escolhemos a camada Service por ser mais manutenível no MVP. Em ambiente com múltiplas aplicações acessando o banco diretamente, triggers seriam necessários."

---

### Q8 — `pedido_id` nullable em `avaliacoes_nps`

"O nullable existe porque há dois tipos de NPS: o **transacional** (após uma entrega específica) e o **relacional** (pesquisa periódica de satisfação geral, sem vínculo com pedido). O modelo suporta os dois.

Nos nossos dados de exemplo, as avaliações 4 e 5 do cliente Gama Serviços têm `pedido_id = null` — são avaliações espontâneas de relacionamento.

A integridade é garantida pela FK com `ON DELETE SET NULL`: quando preenchido, o valor obrigatoriamente referencia um pedido existente. O banco rejeita um `pedido_id` inválido automaticamente."

---

## Bloco 3 — API REST

---

### Q9 — PUT vs. PATCH e concorrência *(pergunta técnica frequente)*

"**PUT** substitui o recurso inteiro — se mandar só o campo `status`, os outros campos sumiriam ou virariam null.

**PATCH** atualiza parcialmente: só os campos enviados são modificados. É semanticamente correto para 'alterar apenas o status'.

O problema de concorrência que persiste: dois usuários leem o pedido com `status = pendente` ao mesmo tempo. Um envia PATCH para `aprovado`, o outro para `cancelado`. O segundo sobrescreve o primeiro sem saber que o estado mudou.

A mitigação é **optimistic locking**: adicionar um campo `versao INT` no pedido. O PATCH inclui a versão atual. O banco executa `UPDATE ... WHERE id=7 AND versao=3` — se não afetar nenhuma linha, retorna **409 Conflict**."

---

### Q10 — Vulnerabilidade `?dias=0`

"Com `dias=0`, a condição `diasSemCompra >= 0` é verdadeira para todos os clientes — o endpoint retorna a base inteira como 'em risco', expondo dados que o vendedor não deveria ver.

A correção no Controller:

```javascript
const dias = parseInt(req.query.dias) || 90;
if (isNaN(dias) || dias < 1 || dias > 3650) {
  return res.status(400).json({
    error: { code: 'PARAMETRO_INVALIDO',
             message: 'dias deve ser entre 1 e 3650.',
             status: 400 }
  });
}
```

HTTP **400 Bad Request**, no padrão de erro que definimos no projeto."

---

### Q11 — Limitação temporal da regra NPS

"O problema é que se o cliente teve notas 5, 4, 3 há dois anos e nunca mais avaliou, o alerta dispara toda vez que a query roda — indefinidamente. O cliente pode ter sido recuperado.

A correção: adicionar um filtro temporal — verificar se a avaliação mais recente é de no máximo 180 dias atrás. Se a última avaliação for muito antiga, não disparar o alerta.

```
SE avaliacoes[0].data_avaliacao >= HOJE - 180 dias:
  SE TODAS as notas <= 6: → ALERTAR
```

O período de 180 dias ficaria configurável (mesma lógica da Q2 — sem hardcode)."

---

### Q12 — Trade-off JWT: duração e armazenamento

"Token curto (1h) = menor janela de exploração se roubado. Se o IdP usar refresh token de longa duração, há menos re-logins, mas um refresh comprometido pode permitir novos access tokens durante sua validade.

O refresh token não deve ficar em **localStorage** porque qualquer script XSS rodando na página consegue lê-lo e exfiltrá-lo — é acessível via JavaScript.

A recomendação é cookie com flags `HttpOnly; Secure; SameSite=Strict`. Com `HttpOnly`, o JavaScript não consegue acessar o cookie. `Secure` garante HTTPS. `SameSite=Strict` mitiga CSRF."

---

## Bloco 4 — Arquitetura

---

### Q13 — Camadas e testes unitários *(pergunta conceitual importante)*

"Com a lógica de negócio isolada no **Service**, um teste unitário de `calcularChurnRisk` não precisa de banco, de Express nem de HTTP. Passamos um repositório mockado por injeção de dependência:

```javascript
const mockRepo = {
  getClientesSemPedido: jest.fn().mockResolvedValue([...])
};
const service = new InsightService(mockRepo);
const resultado = await service.calcularChurnRisk(90);
expect(resultado[0].acao_sugerida).toBe('...');
```

O teste roda em milissegundos e é determinístico. Se o Service instanciasse o Repository internamente, seria impossível mockar — a separação de camadas só viabiliza o teste unitário se houver injeção de dependência."

---

### Q14 — Responsabilidades do API Gateway

"Três responsabilidades que o API Gateway centralizaria:

1. **Rate limiting:** Hoje a API não limita requisições por usuário. Com o Gateway, um vendedor não consegue disparar 1.000 chamadas a `/insights/churn-risk` em um minuto — o Gateway rejeita com **429 Too Many Requests** antes de chegar na aplicação.

2. **Autenticação centralizada:** Hoje o middleware JWT está replicado em todas as rotas Express. Com o Gateway, ele valida o token e injeta os claims no header — os serviços de Vendas, Insights e Notificações não precisam implementar auth individualmente.

3. **Roteamento e versionamento:** Com Gateway, `/v1/insights/*` pode rotear para Lambda enquanto `/v1/pedidos/*` vai para o Elastic Beanstalk — sem o frontend mudar a URL base."

---

### Q15 — Síncrono vs. assíncrono com SQS

"**Síncrono (atual):** usuário clica → API executa a query → retorna o resultado. Latência depende do tempo da query — rápido com base pequena, pode chegar a 5-10 segundos com 100k clientes.

**Assíncrono com SQS:** um job no EventBridge dispara a cada 5 minutos, publica na fila, o Lambda calcula e salva em uma tabela `insights_cache`. O endpoint simplesmente lê do cache — resposta em menos de 50ms. Dados podem ter até 5 minutos de defasagem.

Preferimos síncrono para MVP: dados frescos, base pequena, sem complexidade de fila. O assíncrono entra no médio prazo quando o cálculo se tornar caro.

Para o frontend saber quando o resultado assíncrono está pronto: polling em `GET /insights/status`, WebSocket, ou Server-Sent Events — SSE é o mais simples para notificação unidirecional."

---

## Bloco 5 — Identidade Visual

---

### Q16 — Variação percentual sem contexto

"O problema: '↑ +12%' é ambíguo. 12% em relação a quê? Ao mês anterior? À meta? O gestor pode comemorar +12% sem saber que a meta era +25%.

Solução sem aumentar carga cognitiva: um **seletor de período global** no topo do dashboard (ex: 'Outubro 2024 | vs. mês anterior'). Um controle contextualiza todos os KPIs ao mesmo tempo — mais eficiente do que adicionar texto explicativo em cada card."

---

### Q17 — Acessibilidade WCAG 2.1 e daltonismo

"WCAG 2.1 nível AA exige contraste mínimo de **4,5:1** para texto normal e **3:1** para texto grande.

O âmbar `#F59E0B` sobre fundo branco tem contraste de aproximadamente 2,8:1 — abaixo do mínimo para texto normal. A solução é usar texto escuro `#1E293B` sobre o fundo âmbar, que chega a ~5,2:1.

Para daltonismo vermelho-verde (deuteranopia): nunca comunicar estado só por cor. Um badge 'em risco' em âmbar e um badge 'ativo' em verde parecem idênticos para quem tem deuteranopia. A solução é adicionar ícone (⚠ para risco, ✓ para ativo) ou texto dentro do badge como segundo canal visual."

---

## Bloco 6 — Escalabilidade, Segurança e LGPD

---

### Q18 — Índice composto

"Em um índice composto, a regra é: **colunas de filtro por igualdade primeiro, colunas de range ou ordenação depois**.

Para a query de churn — `WHERE cliente_id = X ORDER BY data_pedido DESC LIMIT 1` — o índice correto é `(cliente_id, data_pedido)`. O banco faz um **Index Scan** direto nas entradas do cliente, já ordenadas por data, e retorna o primeiro registro sem varrer a tabela inteira.

Índice invertido `(data_pedido, cliente_id)` não ajudaria porque o filtro principal é `cliente_id`, não `data_pedido`."

---

### Q19 — LGPD em `responsavel` e `usuario`

"No MVP usamos dados fictícios de PJ — nenhum titular real. Em produção, os nomes de funcionários em `responsavel` e `audit_log.usuario` são dados pessoais segundo o Art. 5º da LGPD.

**Duas medidas técnicas:**

1. **Substituir nome livre por FK:** `responsavel VARCHAR` → `responsavel_id INT FK → usuarios.id`. O nome fica em um único lugar e pode ser anonimizado ou excluído de forma controlada. O log mantém só o ID.

2. **Política de retenção no `audit_log`:** após 2 anos, um job executa `UPDATE audit_log SET usuario = 'anonimizado' WHERE timestamp < NOW() - INTERVAL '2 years'`. Preserva o histórico de operação sem reter dado pessoal além do necessário."

---

### Q20 — Serverless (Lambda + DynamoDB) vs. arquitetura atual

"Três problemas com serverless para o NexusVendas no MVP:

1. **Modelo relacional:** temos 7 tabelas com JOINs complexos. DynamoDB é NoSQL — JOINs multi-tabela exigiriam desnormalização ou múltiplas chamadas na aplicação, aumentando complexidade.

2. **Cold start:** Lambda em Node.js tem cold start de 200ms a 1s na primeira invocação depois de inativo. Para um dashboard que o gerente abre toda manhã, o primeiro acesso seria visivelmente lento. Elastic Beanstalk não tem esse problema.

3. **Curva de aprendizado:** nosso stack é Node.js + Express — que o time já conhece. Lambda exigiria aprender SAM/CDK, modelo de execução stateless e gerenciamento de conexões de banco por invocação.

Recomendamos Elastic Beanstalk + RDS para o MVP. Serverless faz sentido no longo prazo quando os microsserviços já estiverem desacoplados."

---

### Q21 — Inconsistências de dados e mitigações

"**Ponto 1:** `valor_total` em `pedidos` pode ser enviado manualmente sem bater com a soma dos `itens_pedido`. Um pedido com `valor_total = R$10.000` mas itens que somam `R$8.500` distorce todos os KPIs de receita no dashboard.

*Mitigação:* na camada Service, antes de persistir, calcular `SUM(itens.quantidade * itens.preco_unitario)` e ou sobrescrever `valor_total`, ou rejeitar com 400 se divergir.

**Ponto 2:** `clientes.status` pode estar como `ativo` enquanto o insight I-01 já o classifica como em risco. O usuário vê contradição entre a tela de clientes e o dashboard.

*Mitigação:* job diário via EventBridge que executa a regra de churn e atualiza `clientes.status = 'em_risco'` para quem atender o critério, registrando no `audit_log`."

---

## Bloco 7 — Questão Integradora

---

### Q22 — NexusVendas é CRM ou sistema de relatórios? *(a mais difícil — conheça bem)*

"A crítica tem mérito parcial e vou ser honesto sobre isso.

Um CRM completo tem três pilares: **operacional** (automação de força de vendas), **analítico** (análise para segmentação e predição) e **colaborativo** (integração com canais de comunicação).

O NexusVendas entrega:
- **CRM analítico:** sim — os três insights são análise de dados para apoio à decisão.
- **CRM operacional básico:** gestão de pedidos e oportunidades são funcionalidades de automação de força de vendas. Mas não temos disparo de e-mails, gestão de ligações nem integração com canais — itens no backlog.
- **CRM colaborativo:** ausente.

Então o que distingue o NexusVendas de um sistema de relatórios puro? Três coisas: os dados transacionais são proprietários — não são importados de fora; as ações sugeridas estão vinculadas aos alertas — não é só visualização; e o CRUD de clientes e oportunidades fecha o ciclo operacional básico.

O NexusVendas é um **CRM leve**, similar ao Pipedrive ou HubSpot Starter — distinto de Salesforce ou SAP Sales Cloud, que têm automação completa. Posicioná-lo como 'inspirado no SAP Sales Cloud' é defensável como analogia de mercado para médias empresas, não como equivalência funcional."

---

## Bloco 8 — Mecânicas internas em plain language

### Q23 — O que significa “handshake” neste projeto?

"Eu separo duas coisas. O handshake TLS acontece antes do HTTP: navegador e API negociam a versão do protocolo, cifra e certificado, criando um canal HTTPS protegido. Depois vem a autenticação da aplicação: o ERP/IdP entrega um JWT assinado e o frontend o envia como Bearer token.

O `authMiddleware` valida a assinatura com a chave pública do IdP e confere `issuer`, `audience`, `expiração` e `role`. Só então coloca o usuário em `req.user`. Token ausente ou inválido retorna 401; token válido, mas sem permissão para a rota, retorna 403. O NexusVendas não tem login próprio nem emite refresh token: essa responsabilidade fica no ERP/IdP."

### Q24 — Como o banco sincroniza com o ERP?

"Às 02h, o EventBridge dispara a Lambda `SyncJob`. Ela lê o ERP em páginas, normaliza os dados e grava pais antes dos filhos: clientes e produtos, depois pedidos, itens e avaliações.

O identificador `erp_id` é único. Se é a primeira vez, fazemos `INSERT`; se já existe, fazemos `UPDATE` com `ON CONFLICT`. Assim, se a Lambda cair e for executada novamente, ela não cria duplicatas. Cada página gera contadores e `audit_log`; o checkpoint só avança quando a execução inteira termina. Falhas temporárias usam retry com backoff. Um registro ausente em uma leitura parcial não é apagado automaticamente, porque não queremos perder histórico por uma falha de integração."

### Q25 — Qual é o algoritmo completo de churn?

"Para cada cliente, buscamos o pedido mais recente que não foi cancelado. Se não existir pedido, usamos `data_cadastro`. Subtraímos essa data de `data_referencia`, que é explícita para o resultado ser reproduzível. Quando `dias_sem_compra >= 90`, calculamos o ticket médio: acima de R$3.000, sugerimos reativação com 10% de desconto; abaixo disso, ligação de relacionamento. É uma heurística determinística e explicável, não machine learning."

### Q26 — Como oportunidades e funil são calculados?

"Oportunidades são nativas do NexusVendas e operam em tempo real. A API exige cliente, valida a etapa do ENUM, salva o valor estimado e registra a alteração no `audit_log`. O MVP guarda a etapa atual — `captacao`, `proposta`, `negociacao`, `fechado_ganho` ou `fechado_perdido`.

O funil conta quantas oportunidades estão em cada etapa e divide a próxima pela atual. Se `negociacao / proposta < 30%`, sinaliza gargalo; no exemplo, `2 / 9 = 22,2%`. Isso mede estoque atual entre etapas, não conversão histórica. Para conversão histórica, precisaríamos registrar cada transição com data de entrada e saída."

### Q27 — E o NPS crítico?

"Buscamos as três avaliações mais recentes de cada cliente. Se existem exatamente três e todas têm nota menor ou igual a 6, geramos o alerta para Customer Success. `pedido_id` pode ser nulo porque a pesquisa pode não estar vinculada a uma compra específica; quando preenchido, a chave estrangeira garante a referência."

---

## Resumo rápido para revisar antes de entrar na sala

| Pergunta mais provável | Palavra-chave da resposta |
|---|---|
| Q1 — Heurística vs ML | Determinística vs. probabilística; ML no backlog por falta de dados |
| Q4 — Snapshot de preço | Imutabilidade do registro transacional; evita distorção retroativa |
| Q9 — PUT vs PATCH | PATCH parcial; concorrência → optimistic locking com `versao` |
| Q13 — Camadas e testes | Service isolado + injeção de dependência → mockRepo sem banco |
| Q22 — CRM ou relatório | CRM leve; tem dado transacional próprio + ação sugerida vinculada |
