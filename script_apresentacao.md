# Script de Apresentação — NexusVendas
## SAP Start Coding 2026 · apresentação

Cada bloco indica o foco visual do slide e a fala sugerida. Os detalhes de implementação ficam para a sessão de perguntas.

## Sequência sugerida

| Slide | Foco |
|---|---:|---|
| 1 | Capa e proposta de valor |
| 2 | Problema e solução |
| 3 | Personas e user story |
| 4 | Insight I-01: churn |
| 5 | Insights I-02 e I-03 |
| 6 | Banco e dados de exemplo |
| 7 | API, segurança e testes |
| 8 | Experiência visual e wireframes |
| 9 | Arquitetura MVP |
| 10 | Roadmap, escala e custos |
| 11 | MVP e validação |
| 12 | Fechamento |

## Slide 1 — Capa

“Boa tarde. Este é o **NexusVendas**, um módulo de inteligência comercial e experiência do cliente integrado ao ERP.

O produto conecta transações, regras de negócio, insights e ações. Por isso, nosso slogan é: **Venda mais. Perca menos. Decida melhor.**”

Não explique tecnologias ainda. A abertura deve deixar claro o produto e o benefício.

## Slide 2 — Problema e solução

“Empresas de médio porte costumam ter os dados de vendas, relacionamento e satisfação separados. O gestor não enxerga o pipeline completo, o vendedor perde follow-ups e o time de CX percebe o risco de cancelamento tarde demais.

O NexusVendas concentra esses sinais em um painel e transforma dados em ações recomendadas. A inspiração é o SAP Sales Cloud, mas com escopo e complexidade adequados a uma empresa média.”

Conclua apontando o ciclo: **transação → regra → insight → ação**.

## Slide 3 — Personas e user story

“O Gerente Comercial precisa enxergar o funil; o Vendedor precisa priorizar seus próximos contatos; e o Analista de CX precisa agir antes do churn.

A user story central é a do Analista de CX: receber clientes sem pedido há pelo menos 90 dias, com ticket médio e ação sugerida. Assim, a plataforma não apenas informa que existe um problema: ela ajuda a decidir o próximo passo.”

Passe rapidamente pelas três personas. Não leia todas as user stories.

## Slide 4 — Insight I-01: churn

“O primeiro insight é o risco de churn. Na amostra, a Beta está há **118 dias sem comprar** e possui ticket médio de **R$ 4.200 por pedido**.

A regra é determinística: para clientes sem pedido há 90 dias ou mais, calculamos o tempo sem compra e o ticket médio. Para tickets acima de R$ 3.000, a ação sugerida é uma oferta de reativação com 10% de desconto; para tickets menores, sugerimos uma ligação de relacionamento.

Isso não é apresentado como machine learning. É uma heurística explicável, adequada ao MVP. ML entra no roadmap quando houver histórico suficiente para treinar e validar um modelo.”

Enfatize que o sistema explica o motivo do alerta e sugere uma ação.

## Slide 5 — Insights I-02 e I-03

“O segundo insight é NPS crítico. A Gama Serviços possui três avaliações consecutivas de **5, 4 e 3**. A regra identifica a sequência de notas iguais ou menores que 6 e recomenda acionar Customer Success imediatamente.

O terceiro insight é o gargalo do funil: existem **9 oportunidades em proposta** e apenas **2 em negociação**. Isso representa **22,2%**, abaixo da meta de 30%. A ação é revisar a abordagem comercial nessa etapa.

Os três insights cobrem as três dores do produto: reduzir perdas, recuperar relacionamento e melhorar a conversão do pipeline.”

Não transforme NPS em uma sequência de percentuais. Explique que 5, 4 e 3 são notas de satisfação e que o painel geral mostra o NPS convencional de -10.

## Slide 6 — Banco e dados de exemplo

“O banco possui **7 tabelas**: clientes, pedidos, itens de pedido, produtos, oportunidades, avaliações NPS e audit log.

A relação central é cliente, pedido e oportunidade, com avaliações de satisfação separadas das transações. Em itens de pedido, o preço unitário é armazenado como snapshot. Se o catálogo mudar amanhã, o valor histórico do pedido não muda.

A amostra tem 10 clientes, 12 pedidos, 20 oportunidades e 10 avaliações. As quatro anomalias documentadas alimentam os cenários de teste de atraso, churn, NPS e gargalo do funil.”

Mostre o diagrama apenas como apoio. Não leia o dicionário de dados.

## Slide 7 — API, segurança e testes

“A API tem **10 endpoints REST**, implementados em Node.js com Express e organizados em Controller, Service e Repository.

O endpoint principal deste exemplo é `GET /insights/churn-risk?dias=90`, que retorna os clientes, os dias sem compra, o ticket médio e a ação sugerida.

A autenticação usa o JWT emitido pelo IdP do ERP. O módulo valida o token e aplica RBAC para as roles admin, gerente e vendedor. O plano de testes cobre validações, permissões e as três regras de insight.”

Mostre um endpoint e o fluxo de camadas. Deixe os demais endpoints para perguntas.

## Slide 8 — Experiência visual

“A interface usa azul para a operação, âmbar para atenção e vermelho para criticidade, com tipografia Inter.

O dashboard resume as decisões principais: vendas do último mês fechado de **R$ 37.600**, variação de **+166,7%**, NPS **-10** e três alertas de churn.

As telas de pedidos, detalhe do cliente, funil e alertas levam o usuário do indicador até a ação recomendada. O objetivo é que o gestor não precise sair do painel para entender o que fazer.”

Mostre o dashboard e cite somente os KPIs que aparecem no slide. Não entre em detalhes de cada tela.

## Slide 9 — Arquitetura MVP

“No MVP, o frontend React com Vite é servido por S3 e CloudFront. A API Node.js roda no Elastic Beanstalk e o PostgreSQL fica no RDS.

O EventBridge agenda a sincronização diária do ERP por uma Lambda, que executa UPSERTs e registra o processamento no audit log. O fluxo operacional é: frontend, API, banco; o fluxo de integração é: ERP, Scheduler, SyncJob e RDS.

Escolhemos PostgreSQL porque o domínio é relacional e possui JOINs entre clientes, pedidos, itens, produtos e oportunidades.”

Não discuta todos os serviços AWS. Explique apenas a função de cada bloco.

## Slide 10 — Roadmap, escala e custos

“No curto prazo, priorizamos deploy, autenticação, observabilidade e onboarding. No médio prazo, entram Redis para cache de insights, SQS para notificações assíncronas, exportação e aplicativo móvel. No longo prazo, entram ML para churn, microsserviços e multitenancy.

O MVP foi estimado em aproximadamente **US$ 21 a 51 por mês**, considerando Beanstalk, RDS, S3 e CloudFront em configuração básica. A evolução aumenta custo somente quando houver volume que justifique cache, filas e modelos especializados.”

Deixe claro que ML é evolução, não uma promessa do MVP.

## Slide 11 — MVP e validação

“O MVP entrega o ciclo completo: banco relacional documentado, API protegida, três regras de insight, dashboard, telas de apoio e arquitetura de implantação.

Os números apresentados são reproduzíveis na amostra: R$ 37.600 em vendas de outubro de 2024, NPS -10, Beta com 118 dias sem compra e gargalo de 22% no funil. Isso permite testar a regra e explicar o resultado, em vez de mostrar apenas um número sem origem.”

Este é o momento de demonstrar que a proposta é implementável e auditável.

## Slide 12 — Fechamento

“O NexusVendas resolve um problema concreto com tecnologia proporcional ao porte do cliente. Ele conecta:

**Transação → Regra de Negócio → Insight → Ação.**

Começamos com regras explicáveis e uma arquitetura preparada para evoluir. Assim, o produto ajuda a vender mais, perder menos e decidir melhor.

Obrigado. Estou à disposição para as perguntas.”

## Perguntas prováveis

- **É machine learning?** Não no MVP. As três regras são determinísticas e explicáveis; ML está no longo prazo.
- **Por que PostgreSQL?** O domínio é relacional e exige JOINs e consistência transacional.
- **Por que o preço é snapshot?** Para preservar o valor histórico do pedido quando o catálogo mudar.
- **Por que não existe login próprio?** O módulo herda a autenticação do ERP e valida o JWT do IdP corporativo.
- **Como a solução escala?** Cache Redis, filas SQS, read replica, microsserviços e SageMaker entram conforme volume e maturidade.
- **O que significa R$ 37.600?** É o valor comercial dos pedidos não cancelados de outubro/2024, não receita contábil reconhecida.

## Apêndice técnico — explicação em plain language e portucode

Use este bloco nas perguntas técnicas. A ideia é explicar a mecânica sem transformar a apresentação em uma aula de código.

### 1. Segurança: o que acontece no handshake

Existem dois handshakes diferentes:

1. **TLS/HTTPS:** antes da requisição, navegador e API negociam uma conexão criptografada. O certificado prova que o servidor é quem diz ser e os dados passam cifrados.
2. **Autenticação:** o usuário já entrou no ERP. O IdP corporativo emite um JWT assinado. O NexusVendas não faz login próprio e não emite esse token.

```text
usuário entra no ERP
    ↓
IdP autentica e assina um JWT
    ↓
frontend chama a API com "Authorization: Bearer <token>"
    ↓
authMiddleware valida assinatura, issuer, audience, expiração e role
    ↓
token inválido → 401
token válido, mas sem permissão → 403
token válido → req.user chega ao Controller
```

Em linguagem simples: o NexusVendas não confia no nome enviado pelo navegador. Ele confia apenas em um token assinado pelo IdP. A API valida a assinatura com a chave pública do IdP e só depois aplica RBAC (`admin`, `gerente`, `vendedor`).

O refresh token, quando existir, é responsabilidade do ERP/IdP. O módulo não guarda refresh token em `localStorage` e não implementa `/auth/login`.

### 2. Sync do ERP para o banco NexusVendas

O ERP continua sendo a fonte oficial de clientes, pedidos, produtos e avaliações. O RDS é uma cópia otimizada para consulta e insight.

```text
02:00 → EventBridge dispara a Lambda SyncJob
      → SyncJob lê o ERP em páginas
      → normaliza campos e relaciona erp_id
      → UPSERT no RDS
      → grava audit_log e contadores
      → só marca a execução como concluída se todas as páginas terminarem
```

O ponto-chave é a idempotência:

```text
SE erp_id ainda não existe:
    INSERT
SENÃO:
    UPDATE somente os campos sincronizáveis

SE a Lambda cair:
    repetir a execução é seguro
    não cria duplicatas
```

O job deve processar pais antes de filhos (`clientes` antes de `pedidos`, `pedidos` antes de `itens_pedido`), usar retry com backoff para falhas temporárias e só salvar o checkpoint depois do sucesso. Um registro ausente na leitura não é apagado automaticamente: histórico não deve desaparecer por uma falha parcial de integração.

### 3. Oportunidades: como o pipeline funciona

Uma oportunidade é uma possibilidade de venda ligada a um cliente. Ela guarda o estado atual, não todo o filme da negociação:

```text
criar oportunidade:
    cliente_id obrigatório
    etapa inicial = captacao
    valor_estimado opcional
    responsavel opcional

alterar etapa:
    validar se a etapa pertence ao ENUM
    salvar a nova etapa
    registrar antes/depois no audit_log
```

As etapas do MVP são `captacao → proposta → negociacao → fechado_ganho` ou `fechado_perdido`. Como a tabela guarda apenas a etapa atual, o painel mede estoque do funil. Ele ainda não afirma uma conversão histórica real. Para isso, seria necessário adicionar uma tabela de histórico de transições.

### 4. Algoritmo de churn risk

```text
para cada cliente:
    último pedido = pedido mais recente que não foi cancelado

    se não existe pedido:
        referência = data_cadastro
    senão:
        referência = data_pedido do último pedido

    dias_sem_compra = data_referencia - referência

    se dias_sem_compra >= 90:
        ticket = média dos pedidos não cancelados

        se ticket > R$ 3.000:
            ação = oferta de reativação com 10% de desconto
        senão:
            ação = ligação de relacionamento

        adicionar cliente à lista de risco
```

O resultado é reproduzível: mesma base, mesma data de referência e mesma regra produzem a mesma lista. Por isso chamamos de heurística explicável, não de machine learning.

### 5. NPS crítico

```text
para cada cliente:
    buscar as 3 avaliações mais recentes

    se existem exatamente 3
       e todas têm nota <= 6:
        gerar alerta para Customer Success
```

`pedido_id` pode ser nulo porque a pesquisa pode ser relacional, sem estar ligada a uma compra específica. Quando preenchido, a FK garante que o pedido existe.

### 6. Funil e gargalo

```text
etapas = [captacao, proposta, negociacao, fechado_ganho]

para cada par de etapas consecutivas:
    atual = quantidade na primeira etapa
    proxima = quantidade na etapa seguinte

    se atual > 0:
        proporcao = proxima / atual

        se proporcao < 0.30:
            sinalizar gargalo
```

No exemplo, `2 negociacoes / 9 propostas = 22,2%`. O painel recomenda revisar a etapa de proposta. Isso é uma proporção de estoque atual; não é uma taxa histórica de conversão.
