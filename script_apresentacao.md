# Script de Apresentação — NexusVendas
## SAP Start Coding 2026 · 10 minutos

> **Como usar:** cada bloco tem o tempo acumulado entre colchetes. Fale em ritmo normal — não apresse, mas não se perca nos detalhes. O slide já tem o texto; o script é o que você FALA, não lê.

---

## [00:00 — SLIDE 1: Capa]

*Enquanto aparece o slide da capa, olhe para a banca e comece:*

"Boa tarde. Vou apresentar o **NexusVendas**, uma plataforma de inteligência de vendas e experiência do cliente que desenvolvemos como projeto integrador.

O slogan resume o que o produto faz: **Venda mais. Perca menos. Decida melhor.**"

---

## [00:30 — SLIDE 2: Agenda]

*Passe rápido, só para situar a banca:*

"Em 10 minutos vou cobrir: o problema que motivou o produto, quem usa, os três insights principais, banco de dados, API, identidade visual, arquitetura e evolução."

---

## [00:45 — SLIDE 3: O Problema]

*Tom de contexto — apresente como se estivesse explicando para um cliente:*

"**Empresas de médio porte perdem receita porque não identificam clientes em risco de cancelamento a tempo.**

O gestor abre quatro planilhas diferentes para ver como o mês está indo. O vendedor esquece de fazer follow-up. O cliente cancela — e o time de CX fica sabendo pela NPS baixa uma semana depois, quando já é tarde.

O SAP Sales Cloud resolve esse problema para grandes empresas. O **NexusVendas** traz essa mesma inteligência para médias empresas, com custo e complexidade adequados ao porte."

---

## [02:00 — SLIDE 4: Personas]

"Temos **três personas**:
- O **Gerente Comercial**, que não tem visão consolidada do pipeline;
- O **Vendedor**, que perde follow-ups por falta de alertas;
- O **Analista de CX**, que só descobre insatisfação depois do cancelamento.

O produto foi desenhado para resolver a dor concreta de cada um deles."

---

## [02:40 — SLIDE 5: User Stories]

*Escolha uma User Story para detalhar — recomendo a US-02:*

"A US-02 é o coração do produto: *'Como Analista de CX, quero receber uma lista de clientes inativos há 90 dias com o ticket médio de cada um, para priorizar a reativação antes do cancelamento.'*

Esse é exatamente o tipo de informação que hoje existe no banco de dados da empresa, mas nenhum sistema conecta os pontos de forma automática."

---

## [03:20 — SLIDE 6/7: Os 3 Insights — bloco mais importante, 2 minutos]

*Aqui é o diferencial técnico — vá com confiança:*

"O coração do NexusVendas são os **três insights automáticos**. Todo insight segue a mesma estrutura: **o que aconteceu → por que importa → ação sugerida**.

**Insight I-01: Churn Risk.**
*O que aconteceu:* a Beta Distribuidora não compra há 118 dias.
*Por que importa:* o ticket médio dela é R$4.200 por pedido — receita real em risco.
*Ação:* enviar oferta de reativação com 10% de desconto.

A regra é simples: se o cliente ficou sem compra por 90 dias ou mais, verifica-se o ticket médio para escolher a ação. Essa heurística não é ML — é uma regra determinística. O ML está no backlog para quando tivermos dados históricos suficientes.

**Insight I-02: NPS Crítico.**
A Gama Serviços teve três avaliações consecutivas com notas 5, 4 e 3. Três detratores em sequência é sinal de cliente saindo. A ação é acionar o Customer Success imediatamente — antes do cancelamento.

**Insight I-03: Gargalo no Funil.**
De 9 oportunidades em proposta, só 2 avançaram para negociação — 22% de conversão, abaixo da meta de 30%. A ação é revisar o script de abordagem nessa etapa.

Esses três insights cobrem as três dores que identificamos no início: vender mais, perder menos e decidir melhor."

---

## [05:20 — SLIDE 8/9: Banco de Dados]

"O banco tem **7 tabelas** centradas no cliente. A estrutura principal é: cliente tem pedidos, pedidos têm itens, cliente tem oportunidades e avaliações NPS.

Um detalhe de design importante: o campo `preco_unitario` em `itens_pedido` é um **snapshot** — não atualiza quando o preço do produto muda. Isso garante que relatórios financeiros históricos nunca sejam distorcidos retroativamente por atualizações de catálogo.

O banco tem **4 anomalias intencionais** nos dados de exemplo — são exatamente os dados que disparam os três insights que mostrei."

---

## [06:20 — SLIDE 10/11: API REST]

"A API tem **10 endpoints REST** em Node.js com Express, seguindo o padrão de camadas: Controller → Service → Repository.

O endpoint `GET /insights/churn-risk?dias=90` retorna a lista de clientes em risco com o ticket médio e a ação sugerida. Autenticação é via JWT — o token é emitido pelo ERP existente da empresa e o NexusVendas apenas valida.

Temos RBAC com três roles: admin, gerente e vendedor — cada um com acesso limitado ao que precisa."

---

## [07:00 — SLIDE 12/13: Identidade Visual]

"O nome **NexusVendas** vem de *nexus* — ponto de conexão — porque o produto conecta transações, relacionamentos e insights.

A paleta é azul corporativo como cor primária, âmbar para alertas de risco e vermelho para crítico. Tipografia Inter, clean e legível em dashboard.

As três telas principais são: Dashboard com KPIs e alertas, Lista de Pedidos com filtros, e Detalhe do Cliente com histórico e sugestão de ação."

---

## [07:45 — SLIDE 14/15: Arquitetura]

"A arquitetura MVP é em três camadas: React com Vite no frontend hospedado no S3 com CloudFront, API Node.js no Elastic Beanstalk, e PostgreSQL no RDS.

Escolhemos Elastic Beanstalk sobre Lambda por dois motivos: o modelo de dados é relacional com JOINs complexos — PostgreSQL é mais natural que DynamoDB — e eliminamos o problema de cold start para um dashboard que o gerente abre toda manhã.

O custo estimado é **$21 a $50 por mês** no nível de MVP."

---

## [08:45 — SLIDE 16/17: Evolução]

"O roadmap tem **três horizontes**:

- **Curto prazo** (0-6 meses): deploy AWS, JWT, CloudWatch, onboarding.
- **Médio prazo** (6-18 meses): cache Redis para insights, fila SQS para notificações assíncronas, exportação PDF, app mobile.
- **Longo prazo** (18-36 meses): ML para churn no SageMaker, microsserviços, multitenancy.

A arquitetura atual foi desenhada para comportar essa evolução sem reescrita."

---

## [09:30 — SLIDE FINAL: Obrigado]

*Feche com o slogan — dê uma pausa antes:*

"O NexusVendas resolve um problema real, com tecnologia acessível, seguindo os conceitos aprendidos no programa: banco relacional, API REST, arquitetura em camadas, identidade visual coerente e roadmap de evolução sustentável.

**Transação → Regra de Negócio → Insight → Ação.**

Obrigado. Estou à disposição para perguntas."

---

## Dicas para a Q&A (5 min)

- **Se a pergunta for técnica e você souber:** responda diretamente com a solução, não com "nós pensamos em..."
- **Se a pergunta for sobre limitação conhecida:** aceite e explique o que está no backlog para resolver
- **Se não souber:** diga "não implementamos esse ponto, mas a abordagem seria..." — nunca invente
- **Perguntas prováveis da banca:** Q1 (heurística vs ML), Q4 (snapshot de preço), Q9 (PUT vs PATCH), Q13 (camadas e testes unitários), Q22 (CRM ou sistema de relatórios)
- **Tempo:** a Q&A é 5 min — uma pergunta demorada e acabou. Seja objetivo.
