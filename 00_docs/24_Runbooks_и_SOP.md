# Runbooks и SOP

Навигация: [[01_Readme]] | [[13_Наблюдаемость_и_SRE]] | [[23_Threat_Model]]

Версия: v1.2 | Дата: 2026-04-20

## Каталог runbook

| ID | Название | Триггер |
|---|---|---|
| RB-001 | Ingestion queue lag high | pipeline_jobs в статусе queued > 30 мин |
| RB-002 | LLM provider timeout/error spike | LLM error rate > 10% за 5 мин |
| RB-003 | Search latency degradation | P95 /api/v1/search > 1.5s |
| RB-004 | Unauthorized access attempt spike | auth failures > 20/мин в query_logs |
| RB-005 | Wiki lint failures | WikiLintJob status=failed или lint_status=issues > 20% страниц |
| RB-006 | MinIO/S3 unavailable | storage_uri недоступны, upload возвращает 500 |
| RB-007 | PostgreSQL connection exhausted | DB pool timeout, 500 на всех эндпоинтах |
| RB-008 | NotebookLM CLI timeout | generate_quiz/report/podcast timeout > 360s |

## SOP инцидента

1. Детект (алерт + подтверждение через `GET /api/v1/health` и `GET /api/v1/metrics`).
2. Классификация (`P1/P2/P3`).
3. Назначение Incident Commander.
4. Mitigation (feature flag / circuit breaker / rollback).
5. Восстановление сервиса.
6. Postmortem и action items.

## Severity матрица

| Severity | Критерий | SLA реакции | SLA восстановления |
|---|---|---|---|
| P1 | Полная недоступность / утечка данных / AUTH_MODE=demo в prod | 15 мин | 4 часа |
| P2 | Частичная деградация ключевой функции (search, chat, ingestion) | 30 мин | 8 часов |
| P3 | Некритичная деградация (wiki lint, изображения, NotebookLM) | 4 часа | 2 рабочих дня |

## Быстрые действия — RB-002 (LLM provider error spike)

```text
1) Проверить health LLM provider и долю 5xx/timeout (query_logs.provider)
2) Проверить текущий ai_provider в config (GET /api/v1/health)
3) Включить fallback model routing:
   - OpenAI недоступен → переключить AI_PROVIDER=anthropic
   - Anthropic недоступен → AI_PROVIDER=google или ollama
4) Снизить max_tokens для non-critical запросов
5) Активировать response cache для FAQ
6) Оповестить продуктовую команду о degraded mode
7) Восстановить основной провайдер и вернуть AI_PROVIDER=auto
```

## Быстрые действия — RB-001 (Ingestion queue lag)

```text
1) Проверить pipeline_jobs: SELECT status, count(*) FROM pipeline_jobs GROUP BY status;
2) Проверить INGESTION_MAX_CONCURRENT (default=3) — увеличить при необходимости
3) Проверить RUN_INLINE_JOBS — в prod должен быть false (async worker)
4) Перезапустить worker: docker restart bi-aqyl-backend
5) Проверить MinIO доступность (STORAGE_BACKEND=s3)
6) При failed jobs: проверить error_message в pipeline_jobs
```

## Быстрые действия — RB-005 (Wiki lint failures)

```text
1) GET /api/v1/wiki/lint/jobs — последние WikiLintJob
2) Проверить wiki_pages WHERE lint_status = 'issues'
3) POST /api/v1/wiki/lint — запустить lint вручную (требует роль admin)
4) Проверить ENABLE_WIKI_LINT=true и WIKI_LINT_INTERVAL_HOURS=6
5) При системном сбое — отключить ENABLE_WIKI_GENERATION=false временно
```

## Быстрые действия — RB-006 (MinIO unavailable)

```text
1) docker ps — проверить статус bi-aqyl-minio
2) curl http://localhost:9000/minio/health/live
3) docker restart bi-aqyl-minio
4) При потере данных: проверить volume minio_data
5) Временный fallback: STORAGE_BACKEND=local (перезапуск backend)
```

## On-call roster (OI-009 — требует заполнения)

| Роль | Контакт | Часы |
|---|---|---|
| Incident Commander | TBD | TBD |
| Platform On-Call | TBD | TBD |
| AI On-Call | TBD | TBD |
| Security On-Call | TBD | TBD |

Контакт по умолчанию при сбоях AI: `knowledge@bi.group` (из `FALLBACK_CONTACT` в config).

## Postmortem шаблон

См. [[18_Приложения_и_шаблоны]] раздел "Шаблон postmortem".
