# ADR-0005: LLM Provider Selection and Fallback Chain
- Status: accepted
- Date: 2026-03-10

## Context

Платформа использует LLM для трёх классов задач с разными требованиями к quality/latency/cost:
1. **Lightweight**: детекция языка, классификация, тегирование (низкая сложность, высокий RPS)
2. **Mid-tier**: суммаризация, перевод (средняя сложность, умеренный RPS)
3. **High-tier**: сложный Q&A, синтез фреймворков, генерация карточек (высокая сложность, низкий RPS)

Ранее в документах упоминался абстрактный "модельный роутинг" без конкретных model ID и правил переключения.

## Decision

Первичный провайдер — **Anthropic (Claude)**. Fallback на альтернативного провайдера не предусмотрен для MVP (vendor lock-in принят осознанно, пересматривается в Wave 2).

### Маппинг задач → модели

| Задача | Модель | Max tokens (output) | Примечание |
|---|---|---|---|
| Language detect, classification, tagging | `claude-haiku-4-5` | 256 | Latency < 500ms |
| Summarization, translation, deduplication check | `claude-sonnet-4-6` | 2048 | Latency < 1s |
| Insight card generation, complex Q&A, framework synthesis | `claude-opus-4-6` | 4096 | Latency < 3s |

### Fallback chain (при ошибке/timeout)

```
claude-opus-4-6  →  claude-sonnet-4-6  →  insufficient_evidence response
claude-sonnet-4-6  →  claude-haiku-4-5  →  insufficient_evidence response
claude-haiku-4-5  →  insufficient_evidence response
```

Правила:
- Retry: 2 попытки с exponential backoff (1s, 2s).
- Если все модели недоступны — вернуть `503` с `Retry-After` заголовком.
- Downgrade допустим только если задача не требует strict_grounded (например, перевод может упасть на haiku).
- Downgrade для high-tier задач — запрещён без явного флага `allow_quality_degradation=true`.

### Бюджеты токенов (per request)

| Задача | Input max | Output max |
|---|---|---|
| Card generation | 16 000 | 4 096 |
| Q&A | 8 000 | 2 048 |
| Translation | 4 000 | 4 000 |
| Classification | 1 000 | 256 |

Суммарный месячный лимит задаётся в FinOps конфиге (см. `26_FinOps_для_LLM.md`).

## Alternatives Considered

1. **OpenAI GPT-4o**: рассматривался как альтернативный провайдер. Отклонён для MVP из-за неопределённости с data residency и отсутствия корпоративного соглашения.
2. **Dual-provider routing**: параллельные вызовы двух провайдеров для резилиентности. Отклонён — удваивает стоимость, сложно консистентно.
3. **Local/self-hosted LLM (Llama)**: рассматривался для low-latency lightweight задач. Отклонён для MVP из-за GPU-инфраструктурных требований.

## Consequences

- **Плюсы**: простота операционного мониторинга, единый ключ API, предсказуемые SLA, лучшее качество на high-tier задачах.
- **Минусы**: единственный провайдер — риск при outage Anthropic. Митигация: очередь с retry + graceful degradation на `insufficient_evidence`.
- **Пересмотр**: добавить альтернативного провайдера как fallback в Wave 2 при достижении 500+ активных пользователей.
