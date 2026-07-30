# FinOps для LLM

Навигация: [[01_Readme]] | [[03_Цели_и_KPI]] | [[25_AI_Governance_и_Evaluation]]

Версия: v1.2 | Дата: 2026-04-20

## Цель

Контролировать стоимость AI-функций при масштабировании пользователей и предотвращать рост cost-per-active-user более чем на 20% QoQ.

## Cost model

```text
Total Cost = Σ(request_count_endpoint_i × avg_tokens_i × token_price_model_i)
```

## AI-провайдеры и ценовые классы (актуально)

| Провайдер | Модель | Класс | Назначение |
|---|---|---|---|
| OpenAI | gpt-4o-mini | lightweight | Основная LLM (chat, cards, Q&A) |
| OpenAI | whisper-1 | mid | ASR транскрипция |
| OpenAI | gpt-4o-mini-tts | mid | TTS (alloy/nova голоса) |
| OpenAI | dall-e-3 | high | Image generation |
| OpenAI | text-embedding-3-small | low | Embedding |
| Anthropic | claude-sonnet-4-20250514 | mid/high | Fallback LLM |
| Google Gateway | gemini-2.5-pro | mid/high | LLM/VLM fallback |
| Google Gateway | imagen-3.0-generate-002 | high | Image generation |
| Google Gateway | text-embedding-004 | low | Embedding fallback |
| Ollama | llama3.2:3b | free (self-hosted) | Local fallback |
| NotebookLM | — | free tier | EXTERNAL scope artifacts |

## Бюджеты на функцию

| Функция | Модельный класс | Лимит на запрос | Примечание |
|---|---|---:|---|
| Search snippets | lightweight (gpt-4o-mini) | 1k tokens | Только контекст + ответ |
| Card generation | mid (gpt-4o-mini / anthropic) | 8k tokens | Включая RAG-контекст |
| Card Q&A | lightweight | 4k tokens | strict_grounded mode |
| Global chat | lightweight | 4k tokens | SSE streaming |
| Translation batch | mid | 3k tokens | deep-translator + LLM |
| Image generation | high (dall-e-3 / imagen) | 1 image | По запросу |
| TTS podcast | mid | длительность файла | mp3 output |
| NotebookLM | free | — | EXTERNAL scope only |
| Wiki generation | lightweight | 2k tokens | До 4 страниц/документ |

## Guardrails

- Per-user daily token quota (планируется, конфиг через env).
- Per-endpoint max token caps (см. таблицу выше).
- `ENABLE_LLM_RERANK=false` (default) — дорогой LLM-reranking отключён, включается по необходимости.
- Автоматический fallback на cheaper model при budget pressure: OpenAI → Anthropic → Google → Ollama.
- Кеширование популярных Q&A ответов.
- `GOOGLE_GATEWAY_USE_FLASH_IMAGE=true` — использовать Flash-вариант image модели (дешевле).

## Мониторинг затрат

Данные для расчёта стоимости из `query_logs`:
- `provider` — какой провайдер обработал запрос.
- `model_name` — конкретная модель.
- `request_json` — параметры запроса (включая token hints).
- `action` — тип операции (GENERATE_CARD, ASK_GLOBAL, etc.).

## Alerting

- Burn rate > 120% плана за 7 дней.
- Cost per active user > целевого порога.
- Spike в high-tier model calls > 30% WoW.
- Резкий рост `GENERATE_CARD` событий в query_logs.

## Optimization playbook

1. **Сократить контекст**: chunk pruning, уменьшить `_LEXICAL_SEARCH_LIMIT=80` или `_MAX_RESULTS_CAP=20`.
2. **Aggressive cache**: кешировать FAQ и повторяющиеся Q&A.
3. **Downgrade tier**: не-критичные задачи → Ollama llama3.2:3b.
4. **Wiki batch**: wiki generation запускать батчем при ingest, не для каждого чанка отдельно.
5. **ENABLE_LLM_RERANK=false**: держать выключенным если quality metrics в норме.
6. **NotebookLM**: EXTERNAL scope — нулевая стоимость токенов.
7. **Ollama**: dev/test среды → `AI_PROVIDER=ollama` экономит бюджет при разработке.
8. **Блокировать длинные low-value запросы**: policy по max `question` length.
