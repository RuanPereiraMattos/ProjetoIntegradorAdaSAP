# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto do Projeto

Proposta estruturada para o **SAP Start Coding 2026 — Projeto Integrador**.
Produto: **NexusVendas** — plataforma de inteligência de vendas e CX, inspirada no SAP Sales Cloud.
Tema sorteado: **Tema 3 — Vendas e Experiência do Cliente** (receita e relacionamento).

**Prazo:** entrega até 06/11 às 09h via formulário; apresentação 06/11 (10 min + 5 min perguntas).

## Estrutura dos Arquivos

Não há código-fonte. O repositório é inteiramente composto de documentação de proposta:

| Arquivo | Conteúdo |
|---|---|
| `GUIA.md` | Checklist geral, critérios de avaliação e regra dos insights |
| `parte1-visao.md` | Problema, personas, user stories com critérios de aceite, MVP e backlog |
| `parte2-banco.md` | 7 tabelas, dicionário de dados, 10+ registros fictícios por tabela, 3 anomalias intencionais |
| `parte3-api.md` | 10 endpoints REST, exemplos JSON completos, 3 regras de insight em pseudocódigo |
| `parte4-identidade.md` | Nome (NexusVendas), paleta de cores, tipografia, wireframes ASCII das 3 telas |
| `parte5-arquitetura.md` | Diagrama de camadas, serviços AWS, fluxo de requisição, comparação com SAP Sales Cloud |
| `parte6-evolucao.md` | Roadmap em 3 horizontes, gargalos, segurança, LGPD, custos AWS, riscos |
| `apresentacao.md` | 24 slides Marp prontos para exportar como PDF ou PPTX |

## Apresentação (Marp)

O arquivo `apresentacao.md` usa o formato **Marp**. Para exportar:

```bash
# Via CLI
npx @marp-team/marp-cli apresentacao.md --pdf
npx @marp-team/marp-cli apresentacao.md --pptx
```

Ou via extensão **Marp for VS Code** (`marp-team.marp-vscode`): abrir o arquivo → `Ctrl+Shift+P` → "Marp: Export Slide Deck".

Para trocar o tema visual, alterar `theme: default` no frontmatter do `apresentacao.md` para `gaia` ou `uncover`.

## Consistência entre Arquivos

Os arquivos são interdependentes — mudanças em um devem se refletir nos outros:

- Clientes fictícios definidos em `parte2-banco.md` (Beta Distribuidora, Gama Serviços etc.) aparecem nos exemplos JSON de `parte3-api.md` e nos wireframes de `parte4-identidade.md`
- Os 3 insights (I-01 churn, I-02 NPS crítico, I-03 gargalo no funil) aparecem em `parte1-visao.md` §1.6, `parte3-api.md` §3.5 e `apresentacao.md`
- As 3 anomalias (A-01, A-02, A-03) em `parte2-banco.md` §2.5 são os dados que disparam os insights acima
- Os serviços AWS de `parte5-arquitetura.md` devem ser coerentes com os custos estimados em `parte6-evolucao.md`

## Regra Central do Produto

Todo insight deve ter exatamente 3 partes:
> **O que aconteceu** → **Por que importa** → **Ação sugerida**

Essa estrutura deve ser mantida em qualquer novo insight adicionado.

## Pontuação (para priorizar o que completar)

Banco + API + Visão do produto = **60%** da nota. Priorizar essas 3 partes se o tempo for escasso.
