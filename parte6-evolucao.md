# Parte 6 — Evolução e Escalabilidade

## Status: [x] Concluída

---

## 6.1 Roadmap de Evolução (3 Horizontes)

| Horizonte | Período | Foco | Iniciativas |
|---|---|---|---|
| **Curto prazo** | 0–6 meses | MVP estável em produção | Deploy na AWS (Elastic Beanstalk), token ERP via Express middleware (sem login próprio), batch sync diário do ERP (EventBridge + SyncJob), 3 insights automáticos, monitoramento com CloudWatch, onboarding dos primeiros clientes |
| **Médio prazo** | 6–18 meses | Performance e alcance | Cache Redis para insights (TTL 5 min), fila assíncrona SQS para notificações, relatórios exportáveis em PDF, integração com e-mail (SES), app mobile React Native |
| **Longo prazo** | 18–36 meses | Inteligência e escala | ML para predição de churn (SageMaker), microsserviços independentes por domínio, multitenancy (múltiplas empresas), BI avançado com QuickSight, integração nativa com SAP S/4HANA |

---

## 6.2 Pontos de Gargalo Previstos e Soluções

| Gargalo | Quando ocorre | Solução |
|---|---|---|
| Queries lentas nos insights | Tabela `pedidos` ultrapassa 100k registros | Índices em `pedidos(cliente_id, data_pedido)` e `avaliacoes_nps(cliente_id, data_avaliacao)` |
| Alto volume no Dashboard | Muitos usuários acessando simultaneamente | Cache Redis (ElastiCache) para `/insights/*` com TTL de 5 minutos |
| Cálculo síncrono de churn/NPS | Base de clientes cresce — tempo de resposta aumenta | Mover cálculos para jobs assíncronos via SQS + Lambda |
| Banco sobrecarregado com escala da API | Pico de acessos em horário comercial | Read replica no RDS para todas as queries de leitura |
| Crescimento da `audit_log` | Acúmulo histórico sem limite | Particionamento por data (`PARTITION BY RANGE`) ou arquivamento para S3 Glacier após 1 ano |

---

## 6.3 Segurança e LGPD

| Área | Medida implementada |
|---|---|
| **Autenticação** | JWT de acesso com expiração de 1h; renovação/refresh, quando habilitada, fica sob responsabilidade do IdP corporativo |
| **Autorização** | RBAC — roles: `admin` (tudo), `gerente` (leitura + insights), `vendedor` (próprios pedidos) |
| **Dados em trânsito** | HTTPS obrigatório (TLS 1.2+) em todos os endpoints |
| **Dados em repouso** | RDS com encryption at rest habilitado |
| **LGPD** | **Amostra fictícia:** os dados desta proposta são PJ inventados — nenhum titular real. **Em produção real:** o módulo processa dados pessoais (campo `responsavel` em oportunidades, `usuario` em audit_log, comentários NPS, claims do JWT); exige base legal LGPD para cada finalidade, minimização de dados, política de retenção definida para audit_log e NPS, e mascaramento/pseudonimização para logs e exports |
| **Auditoria** | `audit_log` registra todo INSERT/UPDATE/DELETE com usuário e timestamp |
| **Secrets** | Credenciais via AWS Secrets Manager — jamais em variáveis de ambiente no código |
| **Validação de entrada** | Campos obrigatórios validados na API antes de qualquer query ao banco |

---

## 6.4 Observabilidade

| Tipo | Ferramenta | O que monitorar |
|---|---|---|
| Logs de aplicação | CloudWatch Logs | Erros 4xx/5xx, tempo de resposta por endpoint |
| Métricas de infra | CloudWatch Metrics | CPU e memória do EC2/RDS |
| Alertas automáticos | CloudWatch Alarms | CPU > 80%, taxa de erro > 1%, latência > 2s |
| Health check | `GET /health` | Status da API e conectividade com o banco |
| Rastreamento (médio prazo) | AWS X-Ray | Trace de requisições lentas ponta a ponta |

---

## 6.5 Estimativa de Custos na AWS

| Serviço | Configuração | Custo estimado/mês |
|---|---|---|
| Elastic Beanstalk (EC2) | t3.micro — Free Tier elegível | ~$0–10 |
| RDS PostgreSQL | db.t3.micro, 20 GB, Multi-AZ desativado | ~$15–25 |
| S3 + CloudFront | < 1 GB armazenamento, < 10 GB transferência | ~$2–6 |
| EventBridge Scheduler | 1 regra cron — batch sync diário | ~$0–1 |
| CloudWatch | Logs básicos + 3 alarmes | ~$3–8 |
| Secrets Manager | 2 secrets | ~$1 |
| **Total MVP** | | **~$21–51/mês** |

> Médio prazo (+ ElastiCache Redis + SQS + SES): ~$80–150/mês
> Longo prazo (microsserviços + SageMaker + QuickSight): ~$300–600/mês

---

## 6.6 Riscos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Batch sync falha silenciosamente | Média | Alto | CloudWatch Alarm no SyncJob + alerta se log de execução não aparecer em 25h |
| Baixa adoção pelos vendedores | Média | Alto | UX simples, dashboard com valor imediato visível no primeiro acesso |
| Qualidade dos dados (garbage in, garbage out) | Alta | Alto | Validações na API, campos obrigatórios, `audit_log` para rastreabilidade |
| Crescimento inesperado de volume | Baixa | Médio | Elastic Beanstalk com auto-scaling, RDS com possibilidade de read replica |
| Custo AWS acima do planejado | Baixa | Médio | AWS Budgets com alerta a 80% do limite mensal |
| Vazamento de dados de clientes | Baixa | Muito Alto | HTTPS + RBAC + criptografia em repouso + Secrets Manager |

---

## 6.7 Arquitetura Evoluída (Médio/Longo Prazo)

```
               ┌───────────────────┐
               │  React Frontend    │
               │  (S3 + CloudFront) │
               └────────┬──────────┘
                        │ HTTPS
               ┌────────▼──────────┐
               │   API Gateway     │  ← rate limiting, auth centralizada
               └────────┬──────────┘
        ┌───────────────┼──────────────────┐
        │               │                  │
┌───────▼──────┐ ┌──────▼───────┐ ┌───────▼──────┐
│ API Vendas   │ │ API Insights │ │ API Notif.   │
│ (ECS/Fargate)│ │ (Lambda)     │ │ (SQS+Lambda) │
└───────┬──────┘ └──────┬───────┘ └──────────────┘
        │               │
┌───────▼───────────────▼──────────┐
│      RDS PostgreSQL              │
│  (primary + read replica)        │
└──────────────────────────────────┘
        │
┌───────▼──────────┐
│ ElastiCache Redis │  ← cache de insights (TTL 5 min)
└──────────────────┘
```
