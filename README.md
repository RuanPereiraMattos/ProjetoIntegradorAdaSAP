# NexusVendas

Proposta estruturada de plataforma inteligente de vendas e experiência do cliente, desenvolvida como Projeto Integrador do **SAP Start Coding 2026**.

> Transação → Regra de Negócio → Insight → Ação

---

## Sobre o Projeto

**Tema:** Vendas e Experiência do Cliente  
**Produto:** NexusVendas — módulo de CRM e inteligência comercial inspirado no SAP Sales Cloud  
**Empresa fictícia:** Médio porte, operações multissetoriais  

O NexusVendas resolve um problema real de médias empresas: perda de receita por falta de visibilidade do pipeline e ausência de alertas automáticos sobre clientes em risco. A proposta cobre o ciclo completo de um produto ERP — do modelo de dados à arquitetura em nuvem.

---

## Conteúdo da Proposta

| Parte | Arquivo | O que contém |
|---|---|---|
| 1 — Visão do Produto | `parte1-visao.md` | Problema, personas, user stories, MVP e backlog |
| 2 — Banco de Dados | `parte2-banco.md` | 7 tabelas, dicionário de dados, 10+ registros fictícios, 4 anomalias, batch sync |
| 3 — API REST | `parte3-api.md` | 10 endpoints, exemplos JSON, 3 regras de insight em pseudocódigo |
| 4 — Identidade Visual | `parte4-identidade.md` | Nome, paleta, tipografia, wireframes das 3 telas principais |
| 5 — Arquitetura | `parte5-arquitetura.md` | Diagrama de camadas, serviços AWS, fluxo de requisição |
| 6 — Evolução | `parte6-evolucao.md` | Roadmap em 3 horizontes, escalabilidade, segurança, LGPD, custos AWS |

---

## Insights Gerados pelo Produto

Cada insight segue o padrão: **o que aconteceu → por que importa → ação sugerida**

| # | Insight | Ação |
|---|---|---|
| I-01 | Cliente sem compra há ≥ 90 dias | Oferta de reativação baseada no ticket médio |
| I-02 | 3 avaliações NPS consecutivas ≤ 6 | Acionar Customer Success imediatamente |
| I-03 | Conversão de etapa do funil abaixo de 30% | Revisar abordagem na etapa com gargalo |

---

## Apresentação

O arquivo `apresentacao.md` contém **~33 slides** em formato **Marp**, prontos para exportar como PDF ou PPTX. Para uma apresentação de 10 minutos, recomenda-se condensar para ~24 slides antes da entrega.

**Exportar via CLI:**
```bash
npx @marp-team/marp-cli apresentacao.md --pdf
npx @marp-team/marp-cli apresentacao.md --pptx
```

**Exportar via VS Code:**  
Instale a extensão [Marp for VS Code](https://marketplace.visualstudio.com/items?itemName=marp-team.marp-vscode) → abra `apresentacao.md` → `Ctrl+Shift+P` → "Marp: Export Slide Deck".

---

## Stack Proposta

- **Frontend:** React + Vite
- **API:** Node.js + Express
- **Banco:** PostgreSQL
- **Infra:** AWS (Elastic Beanstalk, RDS, S3, CloudFront, CloudWatch, Secrets Manager)
- **Auth:** JWT com RBAC (admin, gerente, vendedor)

---

## Equipe

SAP Start Coding 2026
