# ADR реестр

Навигация: [[01_Readme]] | [[05_Архитектура_системы]] | [[19_Трассируемость_требований]]

Версия: v1.2 | Дата: 2026-04-20

## Назначение

ADR (Architecture Decision Record) фиксирует:
- контекст решения;
- альтернативы;
- принятое решение;
- последствия и риски.

## Реестр

| ID | Заголовок | Статус | Дата |
|---|---|---|---|
| ADR-0001 | Метаданные и векторный индекс раздельно | `accepted` | 2026-03 |
| ADR-0002 | AI Orchestrator как отдельный сервис | `accepted` | 2026-03 |
| ADR-0003 | Гибридный поиск keyword + vector | `accepted` | 2026-03 |
| ADR-0004 | Strict grounded mode по умолчанию | `accepted` | 2026-03 |
| ADR-0005 | LLM fallback chain | `proposed` | 2026-04 |
| ADR-0006 | Migration path OneDrive → S3 | `proposed` | 2026-04 |

### ADR-0001 — Метаданные и векторный индекс раздельно
- **Статус:** accepted
- **Решение:** PostgreSQL 17 хранит метаданные и векторные embedding в одной БД через расширение pgvector. Отдельная Vector DB (Weaviate, Milvus) не используется в MVP.
- **Последствия:** Упрощение инфраструктуры. При >1M чанков или >100 RPS поиска — миграция на выделенный Vector DB.

### ADR-0002 — AI Orchestrator как отдельный сервис
- **Статус:** accepted
- **Решение:** `backend/services/ai/` содержит единый интерфейс для всех LLM-провайдеров. Роутеры не вызывают провайдеров напрямую.
- **Последствия:** Легкая замена провайдера через `AI_PROVIDER` env. Добавление Ollama, Google Gateway без изменения бизнес-логики.

### ADR-0003 — Гибридный поиск keyword + vector
- **Статус:** accepted
- **Решение:** `_LEXICAL_WEIGHT=0.45` (PostgreSQL tsvector/ts_rank) + `_SEMANTIC_WEIGHT=0.55` (pgvector cosine). Лимит кандидатов: 80, итоговый cap: 20 результатов.
- **Последствия:** Лучше работает для смешанных запросов (термины + смысл), чем чистый vector search.

### ADR-0004 — Strict grounded mode по умолчанию
- **Статус:** accepted
- **Решение:** `strict_grounded=True` по умолчанию в chat и ask-эндпоинтах. AI-ответ строится только из найденных чанков. При `insufficient_evidence` — явный fallback.
- **Последствия:** Citation coverage >= 95%, минимизация hallucinations. Снижение creative-режима без явного выбора пользователя.

### ADR-0005 — LLM fallback chain
- **Статус:** proposed (OI-004)
- **Решение (рекомендуемое):** `ai_provider=auto` → OpenAI GPT-4o-mini → Anthropic claude-sonnet-4-20250514 → Google Gateway Gemini 2.5 Pro → Ollama llama3.2:3b.
- **Триггер:** timeout, HTTP 429/500 от провайдера.

### ADR-0006 — Migration path OneDrive → S3
- **Статус:** proposed (OI-006)
- **Решение (рекомендуемое):** Триггер миграции: >50 GB или >500 пользователей. MinIO (S3-compatible) уже в docker-compose. Переключение через `STORAGE_BACKEND=s3`.

## Шаблон ADR

```markdown
# ADR-XXXX: <Title>
- Status: proposed | accepted | deprecated | superseded
- Date: YYYY-MM-DD

## Context

## Decision

## Alternatives Considered

## Consequences

## Rollout Plan

## Links
```

## Правила

- Каждое архитектурное решение, влияющее на NFR, должно иметь ADR.
- Изменение статуса ADR только через PR и review Architect + Security.
- Файлы ADR хранятся в `02_docs/adr/`.
