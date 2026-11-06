# Questões Acadêmicas — Banca Avaliadora NexusVendas

> **Contexto:** Projeto Integrador SAP Start Coding 2026 — Produto: NexusVendas, plataforma de inteligência de vendas para médias empresas.

---

## Bloco 1 — Visão do Produto e Engenharia de Requisitos

**Q1 (Conceitual)**
O backlog lista a predição de churn por ML como item fora do MVP. No entanto, o sistema já implementa uma heurística de churn (clientes sem compra há ≥ 90 dias). Qual a diferença epistemológica entre uma **regra de negócio determinística** e um **modelo preditivo de machine learning** para esse problema? Em que cenário a heurística atual seria suficiente e em que cenário seria inadequada?

---

**Q2 (Analítica)**
A User Story US-02 define como critério de aceite que "clientes com ticket médio > R$3.000 recebem desconto de 10%". Esse valor de threshold está **hardcoded** na regra de negócio. Do ponto de vista de engenharia de software, quais são os riscos dessa abordagem? Como vocês refatorariam a regra para torná-la configurável sem redeployment da aplicação?

---

**Q3 (Aplicada)**
A tagline do produto é *"Venda mais. Perca menos. Decida melhor."* Relacione cada um desses três objetivos com **uma funcionalidade específica** entregue no MVP e explique como cada funcionalidade endereça objetivamente a dor da persona correspondente.

---

## Bloco 2 — Modelagem de Banco de Dados

**Q4 (Conceitual)**
A tabela `itens_pedido` possui o campo `preco_unitario` com a regra: *"Snapshot — não atualiza com o produto"*. Explique o **problema de integridade temporal** que essa decisão de design resolve. O que aconteceria com os relatórios financeiros históricos se o preço fosse referenciado diretamente da tabela `produtos`?

---

**Q5 (Analítica — SQL)**
Com base no dicionário de dados, escreva a query SQL que calcula o **ticket médio por cliente**, retornando apenas clientes com mais de um pedido com status `entregue`, ordenado do maior para o menor ticket médio.

---

**Q6 (Analítica)**
A anomalia A-01 registra que os pedidos 2 e 3 têm `data_entrega_real` posterior à `data_entrega_prev` em mais de 15 dias. **Essa anomalia não dispara um insight automaticamente** — ela serve de precursor para o insight de NPS. Que novo endpoint ou regra de insight vocês adicionariam para detectar atrasos de entrega em tempo real? Defina o critério de disparo, a ação sugerida e o impacto no modelo de dados.

---

**Q7 (Conceitual)**
A tabela `audit_log` registra operações de INSERT, UPDATE e DELETE com um snapshot do estado anterior em formato JSON. Qual é a diferença entre uma abordagem de **auditoria por triggers no banco** versus **auditoria na camada de serviço da API**? Quais são as vantagens e desvantagens de cada abordagem em termos de consistência e manutenibilidade?

---

**Q8 (Analítica)**
O relacionamento entre `pedidos` e `avaliacoes_nps` é **opcional** (pedido_id é nullable). Justifique essa decisão de modelagem. Em que situações uma avaliação NPS sem pedido associado faz sentido do ponto de vista do negócio? E que restrição de integridade garante que, quando preenchido, o `pedido_id` é válido?

---

## Bloco 3 — Design de API REST

**Q9 (Conceitual)**
O sistema usa `PATCH /pedidos/:id/status` em vez de `PUT /pedidos/:id`. Explique a diferença semântica entre os métodos HTTP `PUT` e `PATCH` segundo a especificação REST. Por que `PATCH` é mais adequado para atualização de status? Que problema de concorrência ainda persiste mesmo com PATCH e como ele poderia ser mitigado?

---

**Q10 (Aplicada)**
O endpoint `GET /insights/churn-risk` aceita um parâmetro `?dias=0`. Um vendedor mal-intencionado passa esse valor e obtém todos os clientes retornados como "em risco". Identifique a **vulnerabilidade de validação de entrada** e proponha a correção no nível do Controller, incluindo o código de resposta HTTP adequado e a mensagem de erro no padrão definido no projeto.

---

**Q11 (Analítica)**
A regra I-02 (NPS crítico) verifica as **últimas 3 avaliações** de cada cliente, independentemente de quando foram feitas. Aponte uma limitação dessa abordagem no tempo: o que acontece se um cliente teve notas 5, 4, 3 há dois anos e depois não avaliou mais? O alerta seria disparado? Proponha uma correção na pseudológica que adicione um critério temporal sem quebrar a estrutura do insight.

---

**Q12 (Conceitual)**
O sistema usa JWT de acesso com expiração de 1 hora. Se o IdP corporativo habilitar refresh token, explique o **trade-off de segurança** entre tokens de curta e longa duração. Por que o refresh token não deve ser armazenado no localStorage do navegador? Qual mecanismo de armazenamento vocês recomendariam?

---

## Bloco 4 — Arquitetura de Software

**Q13 (Conceitual)**
O projeto adota o padrão **MVC simplificado em camadas** com as camadas View, Controller, Service e Repository. A justificativa no documento é que "facilita testes unitários nas regras de insight sem precisar de banco real". Explique como essa separação de camadas viabiliza isso concretamente. O que seria um teste unitário da regra `calcularChurnRisk` e quais dependências ele eliminaria?

---

**Q14 (Analítica)**
O diagrama de arquitetura mostra que o React (frontend) se comunica diretamente com a API Node.js via HTTPS. Na arquitetura evoluída do médio/longo prazo, um **API Gateway** é inserido entre o frontend e os serviços. Quais responsabilidades o API Gateway assume que hoje estão distribuídas entre o frontend e a API? Cite pelo menos três responsabilidades com exemplos concretos no contexto do NexusVendas.

---

**Q15 (Aplicada)**
A arquitetura evoluída prevê mover o cálculo dos insights para **AWS Lambda** com processamento via **SQS**. Compare a latência percebida pelo usuário em uma arquitetura síncrona (como a atual) versus assíncrona com fila. Em qual situação cada abordagem é preferível? Como o frontend saberia quando o resultado assíncrono está pronto?

---

## Bloco 5 — Identidade Visual e UX

**Q16 (Aplicada)**
A tela de Dashboard exibe 4 KPIs: Receita do mês, Pedidos ativos, Clientes em risco e NPS (% promotores − % detratores). Segundo os princípios de **design de sistemas de BI**, qual é o problema de exibir variações percentuais (ex: ↑ +12%) sem contexto de período de comparação? Como o design deveria comunicar esse contexto ao usuário sem aumentar a carga cognitiva da tela?

---

**Q17 (Conceitual)**
A paleta de cores usa âmbar (`#F59E0B`) para alertas de risco e vermelho (`#EF4444`) para status crítico. Considerando **acessibilidade WCAG 2.1**, qual é a taxa de contraste mínima exigida para texto sobre fundo âmbar? Como vocês garantiriam que os badges de status sejam acessíveis para usuários com daltonismo vermelho-verde (deuteranopia)?

---

## Bloco 6 — Escalabilidade, Segurança e LGPD

**Q18 (Analítica)**
O documento prevê **índices compostos** em `pedidos(cliente_id, data_pedido)` como solução para queries lentas quando a tabela ultrapassa 100k registros. Explique o conceito de índice composto: em que ordem as colunas devem ser declaradas e por quê? A query da regra de churn (`buscar último pedido por cliente_id ordenado por data DESC`) se beneficia desse índice? Justifique com o plano de execução esperado.

---

**Q19 (Conceitual)**
O projeto afirma conformidade com LGPD argumentando que "nenhum dado pessoal de pessoa física" é armazenado — clientes são PJ fictícios. Em um cenário real de produção, o campo `responsavel` na tabela `oportunidades` (ex: "Carlos Andrade") e o campo `usuario` em `audit_log` **são dados pessoais**. Que obrigações a LGPD imporia sobre esses campos? Proponha duas medidas técnicas para adequação.

---

**Q20 (Aplicada)**
A estimativa de custo aponta $21–50/mês para o MVP na AWS. Um concorrente propõe entregar o mesmo produto em infraestrutura 100% serverless (Lambda + DynamoDB + API Gateway) pelo mesmo custo. Compare as duas arquiteturas em termos de: (a) adequação ao modelo de dados relacional do NexusVendas, (b) cold start e latência percebida, e (c) curva de aprendizado da equipe. Qual você recomendaria para o MVP e por quê?

---

**Q21 (Analítica — Risco)**
A matriz de riscos classifica "qualidade dos dados (garbage in, garbage out)" como **probabilidade Alta e impacto Alto**. Identifique **dois pontos concretos** no modelo de dados atual onde dados inconsistentes poderiam produzir insights incorretos, e proponha uma medida de validação técnica (constraint de banco, validação na API ou job de reconciliação) para cada um.

---

## Bloco 7 — Questão Integradora

**Q22 (Síntese)**
O NexusVendas se posiciona como uma versão do SAP Sales Cloud para médias empresas. O documento mapeia quatro conceitos SAP para implementações no NexusVendas: pipeline de oportunidades, deal scoring, churn prediction e Voice of Customer. Um avaliador argumenta que **o sistema não é um CRM — é apenas um sistema de relatórios com alertas**. Construa uma defesa técnica ou aceite a crítica, distinguindo claramente o que caracteriza um CRM segundo a literatura e onde o NexusVendas se enquadra ou não se enquadra nessa definição.

---

> **Nota para a banca:** As questões Q5 (SQL), Q10 (validação de entrada) e Q15 (arquitetura assíncrona) são as mais técnicas e recomendadas para aferir profundidade de implementação. As questões Q1, Q13 e Q22 avaliam maturidade conceitual e capacidade de defesa crítica.
